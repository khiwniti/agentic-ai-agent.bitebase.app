from typing import Dict, Any, List, Optional
from datetime import timedelta
from pydantic import BaseModel
import asyncio

from restack_ai.agent import agent, log
from src.agents.base_agent import BaseAgent
from src.functions.scraping import ScrapingTools
import time

class ProxyConfig(BaseModel):
    enabled: bool = True
    rotation_interval: int = 300  # seconds
    max_retries: int = 5

class ScrapingTarget(BaseModel):
    url: str
    selectors: Dict[str, str]
    required_fields: List[str]
    pagination: Optional[Dict[str, str]] = None
    dynamic_loading: bool = False
    authentication: Optional[Dict[str, str]] = None

class ScrapingRequest(BaseModel):
    targets: List[ScrapingTarget]
    bypass_methods: List[str] = ["rotation", "stealth", "delays"]
    rate_limit: Dict[str, int] = {"requests_per_second": 1}
    headers_rotation: bool = True
    proxy_config: ProxyConfig = ProxyConfig()

@agent.defn()
class ScrapingAgent(BaseAgent):
    """
    Advanced web scraping agent with autonomous error handling
    and barrier bypassing capabilities
    """

    def __init__(self):
        super().__init__()
        self.browser_configs = {
            "stealth": True,
            "headless": "new",
            "random_user_agent": True
        }
        self.current_proxy = None
        self.last_rotation = 0
        self.success_patterns = {}
        self.error_patterns = {}
        self.scraping_tools = ScrapingTools()

    @agent.event
    async def scrape_data(self, input_data: ScrapingRequest) -> Dict[str, Any]:
        """
        Execute web scraping with intelligent error handling and bypassing
        """
        self.log_action("scraping_started", {
            "target_count": len(input_data.targets),
            "bypass_methods": input_data.bypass_methods
        })

        try:
            results = {}
            for target in input_data.targets:
                target_result = await self._scrape_target(
                    target,
                    input_data.bypass_methods,
                    input_data.rate_limit,
                    input_data.proxy_config
                )
                results[target.url] = target_result

            self.log_action("scraping_completed", {
                "successful_targets": len(results),
                "total_data_points": sum(len(r.get("data", [])) for r in results.values())
            })

            return {
                "results": results,
                "metadata": {
                    "success_rate": self._calculate_success_rate(results),
                    "bypass_statistics": self._get_bypass_statistics(),
                    "extraction_quality": self._assess_data_quality(results)
                }
            }

        except Exception as e:
            error_details = {"error": str(e), "context": "web_scraping"}
            self.log_action("scraping_failed", error_details)
            raise

    async def _scrape_target(
        self,
        target: ScrapingTarget,
        bypass_methods: List[str],
        rate_limit: Dict[str, int],
        proxy_config: ProxyConfig
    ) -> Dict[str, Any]:
        """Handle scraping for a single target with intelligent retries"""
        retry_count = 0
        last_error = None
        
        while retry_count < proxy_config.max_retries:
            try:
                # Rotate proxy if needed
                await self._handle_proxy_rotation(proxy_config)

                # Apply stealth measures
                browser = await self._setup_browser(bypass_methods)
                
                # Execute scraping with error detection
                data = await self._execute_scraping(
                    browser,
                    target,
                    rate_limit
                )

                # Validate extracted data
                if self._validate_data(data, target.required_fields):
                    return {
                        "status": "success",
                        "data": data,
                        "metadata": {
                            "retries": retry_count,
                            "proxy_used": self.current_proxy,
                            "bypass_methods": bypass_methods
                        }
                    }

            except Exception as e:
                last_error = e
                retry_count += 1
                
                # Analyze error and adjust strategy
                new_strategy = await self._analyze_error_and_adapt(
                    e,
                    bypass_methods,
                    retry_count
                )
                bypass_methods = new_strategy.get("bypass_methods", bypass_methods)
                
                # Update error patterns for future reference
                self._update_error_patterns(str(e), target.url)
                
                await asyncio.sleep(retry_count * 2)  # Exponential backoff

        return {
            "status": "failed",
            "error": str(last_error),
            "metadata": {
                "retries": retry_count,
                "last_proxy": self.current_proxy,
                "bypass_attempts": bypass_methods
            }
        }

    async def _execute_scraping(
        self,
        browser: Any,
        target: ScrapingTarget,
        rate_limit: Dict[str, int]
    ) -> List[Dict[str, Any]]:
        """Execute the actual scraping with rate limiting"""
        page = await self.scraping_tools.create_stealth_page(browser)
        
        try:
            # Respect rate limits
            current_time = time.time()
            if target.url in self.last_request_time:
                time_since_last = current_time - self.last_request_time[target.url]
                if time_since_last < (1 / rate_limit["requests_per_second"]):
                    await asyncio.sleep(1 / rate_limit["requests_per_second"] - time_since_last)

            # Navigate to page
            await page.goto(target.url, wait_until="networkidle")
            self.last_request_time[target.url] = time.time()

            # Handle potential Cloudflare protection
            if await self.scraping_tools.handle_cloudflare(page):
                self.log_action("cloudflare_bypassed", {"url": target.url})

            # Check for IP ban
            if await self.scraping_tools.check_ban_status(page):
                raise Exception("IP banned - rotation needed")

            # Handle dynamic loading if needed
            if target.dynamic_loading:
                await self.scraping_tools.handle_dynamic_loading(page)

            data = []
            page_num = 1

            while True:
                # Extract data from current page
                page_data = await self.scraping_tools.extract_data(
                    page,
                    target.selectors,
                    target.required_fields
                )
                data.extend(page_data)

                # Handle pagination if configured
                if target.pagination and page_num < target.pagination.get("max_pages", 1):
                    has_next = await self.scraping_tools.handle_pagination(page, target.pagination)
                    if not has_next:
                        break
                    page_num += 1
                else:
                    break

            return data

        except Exception as e:
            self.log_action("scraping_error", {
                "url": target.url,
                "error": str(e)
            })
            raise
        finally:
            await page.close()

    async def _handle_proxy_rotation(self, config: ProxyConfig) -> None:
        """Handle proxy rotation and management"""
        current_time = time.time()
        
        if (
            config.enabled and
            (
                not self.current_proxy or
                current_time - self.last_rotation > config.rotation_interval
            )
        ):
            new_proxy = await self.scraping_tools.rotate_proxy()
            if new_proxy:
                self.current_proxy = new_proxy
                self.last_rotation = current_time
                self.log_action("proxy_rotated", {"new_proxy": new_proxy})

    async def _setup_browser(self, bypass_methods: List[str]) -> Any:
        """Set up browser with stealth and bypass configurations"""
        use_stealth = "stealth" in bypass_methods
        browser = await self.scraping_tools.setup_browser(stealth=use_stealth)
        
        self.log_action("browser_setup", {
            "stealth_mode": use_stealth,
            "bypass_methods": bypass_methods
        })
        
        return browser

    async def _analyze_error_and_adapt(
        self,
        error: Exception,
        current_methods: List[str],
        retry_count: int
    ) -> Dict[str, Any]:
        """Analyze errors and adapt bypass strategy"""
        error_str = str(error).lower()
        error_type = self._categorize_error(error_str)
        
        # Base strategy
        strategy = {
            "bypass_methods": current_methods.copy(),
            "wait_time": retry_count * 2,
            "error_type": error_type
        }

        # Learn from error patterns
        url_patterns = self.error_patterns.get(error_str, [])
        if url_patterns:
            recent_patterns = [
                p for p in url_patterns
                if time.time() - p["timestamp"] < 3600  # Last hour
            ]
            if recent_patterns:
                strategy["pattern_detected"] = True
                strategy["pattern_frequency"] = len(recent_patterns)

        # Adapt strategy based on error type
        if error_type == "captcha_detection":
            strategy["bypass_methods"].extend([
                "stealth",
                "human_like_behavior",
                "proxy_rotate"
            ])
            strategy["wait_time"] = max(30, strategy["wait_time"])
            
        elif error_type == "cloudflare_protection":
            strategy["bypass_methods"].extend([
                "wait",
                "js_rendering",
                "cookie_persistence"
            ])
            strategy["wait_time"] = max(20, strategy["wait_time"])
            
        elif error_type == "ip_ban":
            strategy["bypass_methods"] = ["proxy_rotate"] + strategy["bypass_methods"]
            strategy["force_proxy_rotation"] = True
            strategy["wait_time"] = max(60, strategy["wait_time"])
            
        elif error_type == "rate_limit":
            strategy["bypass_methods"].append("adaptive_rate_limit")
            strategy["wait_time"] = max(
                strategy["wait_time"],
                self._calculate_backoff_time(retry_count)
            )
            
        elif error_type == "timeout":
            strategy["bypass_methods"].extend([
                "connection_optimize",
                "retry_with_backoff"
            ])
            strategy["wait_time"] = min(strategy["wait_time"] * 1.5, 300)

        # Add dynamic behavior based on retry count
        if retry_count > 2:
            strategy["bypass_methods"].extend([
                "randomize_headers",
                "vary_request_patterns"
            ])

        # Remove duplicate methods while preserving order
        strategy["bypass_methods"] = list(dict.fromkeys(strategy["bypass_methods"]))

        self.log_action("strategy_adaptation", {
            "error_type": error_type,
            "retry_count": retry_count,
            "new_strategy": strategy
        })

        return strategy

    def _calculate_backoff_time(self, retry_count: int) -> float:
        """Calculate exponential backoff time with jitter"""
        base_delay = min(300, 2 ** retry_count)  # Cap at 5 minutes
        jitter = random.uniform(0, 0.1 * base_delay)  # 10% jitter
        return base_delay + jitter

    def _validate_data(
        self,
        data: List[Dict[str, Any]],
        required_fields: List[str]
    ) -> bool:
        """Validate extracted data against requirements"""
        if not data:
            return False
        
        for item in data:
            if not all(field in item for field in required_fields):
                return False
        
        return True

    def _calculate_success_rate(self, results: Dict[str, Any]) -> float:
        """Calculate success rate of scraping operations"""
        total = len(results)
        if not total:
            return 0.0
        
        successful = sum(1 for r in results.values() if r.get("status") == "success")
        return successful / total

    def _get_bypass_statistics(self) -> Dict[str, Any]:
        """Get statistics about bypass method effectiveness"""
        total_attempts = sum(self.error_count.values())
        if total_attempts == 0:
            return {
                "total_attempts": 0,
                "success_rate": 0.0,
                "error_distribution": {}
            }

        error_distribution = {
            error_type: (count / total_attempts) * 100
            for error_type, count in self.error_count.items()
        }

        success_patterns = {
            pattern: count
            for pattern, count in self.success_patterns.items()
            if count > 0
        }

        return {
            "total_attempts": total_attempts,
            "error_distribution": error_distribution,
            "successful_patterns": success_patterns,
            "most_common_errors": sorted(
                self.error_count.items(),
                key=lambda x: x[1],
                reverse=True
            )[:5]
        }

    def _assess_data_quality(self, results: Dict[str, Any]) -> Dict[str, float]:
        """Assess the quality of extracted data"""
        total_fields = 0
        filled_fields = 0
        consistent_format = 0
        expected_fields = set()

        # Collect expected fields from all results
        for result in results.values():
            if isinstance(result, dict) and "data" in result:
                for item in result["data"]:
                    expected_fields.update(item.keys())

        # Analyze each result
        for result in results.values():
            if isinstance(result, dict) and "data" in result:
                for item in result["data"]:
                    # Check completeness
                    total_fields += len(expected_fields)
                    filled_fields += sum(1 for field in expected_fields if field in item)

                    # Check format consistency
                    for field in expected_fields:
                        if field in item:
                            # Add your specific format validation logic here
                            consistent_format += 1

        completeness = filled_fields / total_fields if total_fields > 0 else 0.0
        consistency = consistent_format / filled_fields if filled_fields > 0 else 0.0
        
        # Accuracy is harder to determine without ground truth
        # Here we use a heuristic based on the consistency of the data
        accuracy = (completeness + consistency) / 2

        return {
            "completeness": round(completeness, 2),
            "accuracy": round(accuracy, 2),
            "consistency": round(consistency, 2)
        }

    def _update_error_patterns(self, error: str, url: str) -> None:
        """Update error pattern database for future reference"""
        error_type = self._categorize_error(error)
        
        if error_type not in self.error_count:
            self.error_count[error_type] = 0
        self.error_count[error_type] += 1

        # Store URL-specific error patterns
        if url not in self.error_patterns:
            self.error_patterns[url] = []
        self.error_patterns[url].append({
            "error_type": error_type,
            "timestamp": time.time(),
            "error_message": error
        })

        # Cleanup old patterns
        self._cleanup_old_patterns()

    def _categorize_error(self, error: str) -> str:
        """Categorize error type for pattern learning"""
        error_lower = error.lower()
        if "captcha" in error_lower:
            return "captcha_detection"
        elif "cloudflare" in error_lower:
            return "cloudflare_protection"
        elif "timeout" in error_lower:
            return "timeout"
        elif "banned" in error_lower or "blocked" in error_lower:
            return "ip_ban"
        elif "not found" in error_lower:
            return "not_found"
        elif "rate limit" in error_lower:
            return "rate_limit"
        return "unknown"

    def _cleanup_old_patterns(self, max_age: int = 86400) -> None:
        """Clean up old error patterns"""
        current_time = time.time()
        
        for url in list(self.error_patterns.keys()):
            self.error_patterns[url] = [
                pattern for pattern in self.error_patterns[url]
                if current_time - pattern["timestamp"] < max_age
            ]
            
            if not self.error_patterns[url]:
                del self.error_patterns[url]

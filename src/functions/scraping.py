from typing import Dict, Any, List, Optional
import asyncio
from playwright.async_api import async_playwright, Browser, Page
import aiohttp
import random
import time
from datetime import datetime
from fake_useragent import UserAgent
import logging

class ScrapingTools:
    def __init__(self):
        self.user_agent = UserAgent()
        self.browser: Optional[Browser] = None
        self.proxy_list: List[str] = []
        self.last_request_time = {}
        self.error_count = {}

    async def setup_browser(self, stealth: bool = True) -> Browser:
        """Initialize browser with stealth settings"""
        playwright = await async_playwright().start()
        
        browser_args = [
            '--disable-blink-features=AutomationControlled',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
            '--disable-site-isolation-trials'
        ]

        if stealth:
            browser_args.extend([
                '--disable-javascript',
                '--disable-geolocation',
                '--disable-notifications',
                '--disable-plugins',
                '--disable-automation'
            ])

        self.browser = await playwright.chromium.launch(
            headless=True,
            args=browser_args
        )
        return self.browser

    async def create_stealth_page(self, browser: Browser) -> Page:
        """Create a page with anti-detection measures"""
        page = await browser.new_page()
        
        # Override browser fingerprinting
        await page.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined
            });
            Object.defineProperty(navigator, 'plugins', {
                get: () => [1, 2, 3, 4, 5]
            });
            window.chrome = {
                runtime: {}
            };
        """)

        # Set random viewport size
        width = random.randint(1024, 1920)
        height = random.randint(768, 1080)
        await page.set_viewport_size({"width": width, "height": height})

        # Set random user agent
        await page.set_extra_http_headers({
            "User-Agent": self.user_agent.random
        })

        return page

    async def rotate_proxy(self) -> str:
        """Get next proxy from pool"""
        if not self.proxy_list:
            await self._refresh_proxy_list()
            
        if self.proxy_list:
            return random.choice(self.proxy_list)
        return ""

    async def _refresh_proxy_list(self) -> None:
        """Fetch fresh proxies from providers"""
        try:
            # TODO: Implement actual proxy fetching from your provider
            # This is a placeholder for demonstration
            self.proxy_list = [
                "http://proxy1.example.com:8080",
                "http://proxy2.example.com:8080"
            ]
        except Exception as e:
            logging.error(f"Failed to refresh proxy list: {e}")

    async def handle_cloudflare(self, page: Page) -> bool:
        """Handle Cloudflare protection"""
        try:
            # Check for Cloudflare challenge
            if await page.query_selector("iframe[title*='challenge']"):
                # Wait for challenge to complete
                await page.wait_for_selector("iframe[title*='challenge']", state="hidden", timeout=30000)
                return True
            return False
        except Exception as e:
            logging.error(f"Cloudflare handling failed: {e}")
            return False

    async def extract_data(
        self,
        page: Page,
        selectors: Dict[str, str],
        required_fields: List[str]
    ) -> List[Dict[str, Any]]:
        """Extract data using provided selectors"""
        data = []
        
        try:
            for selector, field_name in selectors.items():
                elements = await page.query_selector_all(selector)
                
                for element in elements:
                    text = await element.text_content()
                    if text and all(field in text for field in required_fields):
                        data.append({
                            "content": text.strip(),
                            "field": field_name,
                            "timestamp": datetime.now().isoformat()
                        })

        except Exception as e:
            logging.error(f"Data extraction failed: {e}")

        return data

    async def handle_pagination(
        self,
        page: Page,
        pagination_config: Dict[str, str]
    ) -> bool:
        """Handle pagination if available"""
        try:
            next_button = await page.query_selector(pagination_config.get("next_button", ""))
            if next_button:
                await next_button.click()
                await page.wait_for_load_state("networkidle")
                return True
            return False
        except Exception as e:
            logging.error(f"Pagination failed: {e}")
            return False

    async def handle_dynamic_loading(self, page: Page) -> None:
        """Handle dynamically loaded content"""
        try:
            # Scroll to bottom to trigger lazy loading
            await page.evaluate("""
                window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: 'smooth'
                });
            """)
            
            # Wait for network to be idle
            await page.wait_for_load_state("networkidle")
            
            # Wait additional time for any animations
            await asyncio.sleep(2)
            
        except Exception as e:
            logging.error(f"Dynamic loading handling failed: {e}")

    def analyze_error(self, error: Exception) -> Dict[str, Any]:
        """Analyze error and suggest bypass strategy"""
        error_str = str(error).lower()
        
        if "cloudflare" in error_str:
            return {
                "type": "protection",
                "strategy": ["wait", "cloudflare_bypass"],
                "wait_time": 20
            }
        elif "captcha" in error_str:
            return {
                "type": "captcha",
                "strategy": ["proxy_rotate", "user_agent_rotate"],
                "wait_time": 10
            }
        elif "timeout" in error_str:
            return {
                "type": "timeout",
                "strategy": ["retry", "proxy_rotate"],
                "wait_time": 5
            }
        elif "blocked" in error_str:
            return {
                "type": "ip_block",
                "strategy": ["proxy_rotate", "stealth_mode"],
                "wait_time": 30
            }
        
        return {
            "type": "unknown",
            "strategy": ["retry"],
            "wait_time": 5
        }

    async def check_ban_status(self, page: Page) -> bool:
        """Check if the current IP is banned"""
        common_ban_indicators = [
            "access denied",
            "your ip has been blocked",
            "too many requests",
            "rate limited"
        ]
        
        content = await page.content()
        content = content.lower()
        
        return any(indicator in content for indicator in common_ban_indicators)

    async def cleanup(self) -> None:
        """Clean up resources"""
        if self.browser:
            await self.browser.close()

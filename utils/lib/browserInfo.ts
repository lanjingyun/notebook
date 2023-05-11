export default function getBrowserInfo() {
  let nav: Navigator | null = null, userAgent: string | null = null
  if (typeof navigator !== 'undefined') {
    nav = navigator
    userAgent = nav.userAgent
  }
  /* 设备型号 */
  let device: string | null = null
  if (/iphone|ipod/i.test(userAgent)) {
    device = 'iphone'
  } else if (/ipad/i.test(userAgent) || (nav?.platform === 'MacIntel' && nav?.maxTouchPoints > 1)) {
    device = 'ipad'
  }
  /* 操作系统 */
  let OS: string | null = null
  if (device === 'iphone' || device === 'ipad') {
    OS = 'ios'
  } else if (/android/i.test(userAgent)) {
    OS = 'android'
  } else if (/mac OS x/i.test(userAgent)) {
    OS = 'mac'
  } else if (/windows/i.test(userAgent)) {
    OS = 'windows'
  } else if (/linux/i.test(userAgent)) {
    OS = 'linux'
  }
  /* 浏览器类型 */
  let browserAgent: string | null = null, browser: string | null = null
  if (/samsungbrowser\//i.test(userAgent)) {
    browser = 'samsung'
    browserAgent = 'samsungbrowser'
  } else if (/edg\//i.test(userAgent)) {
    browser = 'edge'
    browserAgent = 'edg'
  } else if (/edga\//i.test(userAgent)) {
    browser = 'edge'
    browserAgent = 'edga'
  } else if (/opt\//i.test(userAgent)) {
    browser = 'opera'
    browserAgent = 'opt'
  } else if (/opr\//i.test(userAgent)) {
    browser = 'opera'
    browserAgent = 'opr'
  } else if (/chrome\//i.test(userAgent)) {
    browser = 'chrome'
  } else if (/safari\//i.test(userAgent)) {
    browser = 'safari'
  } else if (/firefox\//i.test(userAgent)) {
    browser = 'firefox'
  }
  if (browserAgent == null) browserAgent = browser
  /* 版本 */
  let version: string | null = null, versionMajor: number | null = null, versionMinor: number | null = null
  const versionMatch = userAgent.match(/version\/([\d.]+)/i)
  if (versionMatch != null) {
    version = versionMatch[1]
  } else if (browserAgent) {
    const versionMatch = userAgent.match(
      new RegExp(`${browserAgent}/([\\d.]+)`, 'i')
    )
    if (versionMatch != null) {
      version = versionMatch[1]
    }
  }
  if (version != null) {
    const versionParts = version.split('.')
    versionMajor = Number(versionParts[0])
    if (versionParts.length > 1) {
      versionMinor = Number(versionParts[1])
    }
  }
  /* 移动设备 */
  const isMobile = OS === 'ios' || OS === 'android' || /mobile/i.test(userAgent)

  return { userAgent, browser, version, versionMajor, versionMinor, device, OS, isMobile }
}

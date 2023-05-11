import type { AppProps } from 'next/app'
import '../styles/globals.css'
import React, { useEffect } from 'react';
import 'antd/dist/reset.css';

const Context = React.createContext({})
export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // 访问统计
    var _hmt = _hmt || [];
    var hm = document.createElement("script");
    hm.src = "https://hm.baidu.com/hm.js?b45de93c8cf1d911595b37f3ca80cd25";
    var s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(hm, s);
  }, [])
  return (
    <Context.Provider value={{}}>
      <Component {...pageProps} />
    </Context.Provider>
  )
}

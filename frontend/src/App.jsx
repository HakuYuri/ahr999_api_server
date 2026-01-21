import React, { useState, useEffect, useRef } from 'react';
import { 
  RefreshCw, TrendingUp, DollarSign, Activity, Clock, AlertCircle, 
  Bell, Calculator, Smartphone, CheckCircle, XCircle, Github, ExternalLink, Globe 
} from 'lucide-react';

// --- 配置 ---
// 安全地获取 API 地址：优先使用环境变量，如果环境不支持 import.meta (如某些预览环境) 则回退到默认地址
const getBaseUrl = () => {
  try {
    // 检查 import.meta 和 import.meta.env 是否存在，避免在不支持的环境中报错
    // 注意：在标准 Vite 项目中，import.meta.env.VITE_API_BASE_URL 是可用的
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL;
    }
  } catch (e) {
    // 忽略任何获取环境变量时的错误
  }
  return 'https://ahr999.3geeks.top';
};

const BASE_URL = getBaseUrl();

// --- 翻译字典 ---
const translations = {
  zh: {
    title: "BTC 定投风向标",
    subtitle: "AHR999 Index Monitor",
    next_update: "下次更新",
    loading: "加载中...",
    error_fetch: "无法获取数据 (可能是跨域限制 CORS 或服务器错误)",
    
    // 状态卡片
    status_bottom: "极度贪婪 (抄底)",
    status_bottom_sub: "千载难逢的机会，建议加大定投力度",
    status_dca: "定投区间",
    status_dca_sub: "价格合理，适合按计划持续定投",
    status_bubble: "泡沫区间 (等待)",
    status_bubble_sub: "价格过高，建议停止定投或分批止盈",
    
    // 进度条刻度
    scale_bottom: "0.45 (抄底)",
    scale_dca: "1.20 (定投顶)",
    
    // 数据卡片 (Title 保持中文，Desc 保持原有的英文风格作为装饰)
    card_price_title: "当前 BTC 价格",
    card_price_desc: "Real-time Price",
    card_cost_title: "200日定投成本",
    card_cost_desc: "200-Day DCA Cost",
    card_val_title: "指数增长估值",
    card_val_desc: "Exp. Growth Valuation",
    
    update_time: "数据更新时间",
    
    // Bark 模块
    bark_title: "在 iPhone 上订阅通知",
    bark_desc: "当 15 分钟内价格变动大于 1% 时，发送 Bark 通知推送。",
    bark_label: "Bark URL",
    bark_btn_sub: "订阅通知",
    bark_btn_unsub: "取消订阅",
    bark_processing: "处理中...",
    bark_help_title: "如何获取订阅链接？",
    bark_help_step1: "在 iPhone/iPad/Mac 上前往 App Store 下载",
    bark_help_step1_app: "Bark",
    bark_help_step1_end: "App。",
    bark_help_step2: "打开 App，点击“注册设备”，你将看到一个专属的 URL。",
    bark_help_step3: "复制该链接（例如 https://api.day.app/xxxx/）并粘贴到左侧文本框中。",
    
    msg_sub_success: "订阅成功！已发送测试通知。",
    msg_unsub_success: "已成功取消订阅。",
    msg_fail_prefix: "请求失败 (Code: ",
    msg_fail_suffix: ")，请检查 URL 是否正确。",
    msg_url_err: "URL 格式错误，无法编码",
    msg_net_err: "网络请求错误，请检查网络或跨域设置。",
    msg_default_url_joke: "嘿！这只是个示例链接，你需要用你自己的 Bark 链接，不然通知会发到火星去！🚀",
    
    // 计算器模块
    calc_ahr_title: "根据价格计算 AHR999",
    calc_input_price: "BTC 价格 (USD)",
    
    calc_price_title: "根据 AHR999 计算价格",
    calc_input_ahr: "AHR999 目标值",
    
    calc_btn: "计算",
    calc_res_price: "推算价格",
    calc_res_ahr: "推算指数",
    calc_click: "点击计算查看结果",
    calc_fail: "计算失败",

    // 页脚
    footer_github: "HakuYuri/ahr999_api_server",
    footer_disclaimer: "免责声明：投资有风险，数据仅供参考。"
  },
  en: {
    title: "BTC DCA Indicator",
    subtitle: "AHR999 Index Monitor",
    next_update: "Next Update",
    loading: "Loading...",
    error_fetch: "Failed to fetch data (Check CORS or Network)",
    
    status_bottom: "Bottom Fishing (Buy the Dip)",
    status_bottom_sub: "Rare opportunity, increase DCA amount significantly.",
    status_dca: "DCA Zone",
    status_dca_sub: "Reasonable price, continue DCA plan.",
    status_bubble: "Bubble Zone (Wait)",
    status_bubble_sub: "Price too high, stop DCA or take profit.",
    
    scale_bottom: "0.45 (Dip)",
    scale_dca: "1.20 (DCA Top)",
    
    card_price_title: "Current BTC Price",
    card_price_desc: "Real-time Price",
    card_cost_title: "200-Day DCA Cost",
    card_cost_desc: "Average Cost",
    card_val_title: "Exp. Growth Valuation",
    card_val_desc: "Fair Value",
    
    update_time: "Last Updated",
    
    bark_title: "Subscribe to Notifications (iPhone)",
    bark_desc: "Send Bark notification when price changes > 1% in 15 mins.",
    bark_label: "Bark URL",
    bark_btn_sub: "Subscribe",
    bark_btn_unsub: "Unsubscribe",
    bark_processing: "Processing...",
    bark_help_title: "How to get the link?",
    bark_help_step1: "Download",
    bark_help_step1_app: "Bark",
    bark_help_step1_end: "App from App Store on iPhone/iPad/Mac.",
    bark_help_step2: "Open App, click 'Register Device' to get your unique URL.",
    bark_help_step3: "Copy the link (e.g. https://api.day.app/xxxx/) and paste it here.",
    
    msg_sub_success: "Subscribed! Test notification sent.",
    msg_unsub_success: "Unsubscribed successfully.",
    msg_fail_prefix: "Request Failed (Code: ",
    msg_fail_suffix: "), check your URL.",
    msg_url_err: "Invalid URL format",
    msg_net_err: "Network Error, check CORS or connection.",
    msg_default_url_joke: "Hey! That's just a placeholder. Use your own Bark link, or the notification goes to Mars! 🚀",
    
    calc_ahr_title: "Calculate AHR999 from Price",
    calc_input_price: "BTC Price (USD)",
    
    calc_price_title: "Calculate Price from AHR999",
    calc_input_ahr: "Target AHR999",
    
    calc_btn: "Calculate",
    calc_res_price: "Est. Price",
    calc_res_ahr: "Est. Index",
    calc_click: "Click to calculate",
    calc_fail: "Calculation Failed",

    // Footer
    footer_github: "HakuYuri/ahr999_api_server",
    footer_disclaimer: "Disclaimer: Investment involves risk. Data is for reference only."
  }
};

const App = () => {
  // 语言状态初始化：检测浏览器语言
  const [lang, setLang] = useState(() => {
    if (typeof navigator !== 'undefined') {
      const l = navigator.language || navigator.userLanguage || 'en';
      // 如果是中文（简体 zh-CN, 繁体 zh-TW/HK 等），默认为 zh，否则 en
      return l.toLowerCase().startsWith('zh') ? 'zh' : 'en';
    }
    return 'en';
  });

  const t = translations[lang]; // 当前语言包

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [timeLeft, setTimeLeft] = useState(60); 
  const [priceTrend, setPriceTrend] = useState('neutral'); 
  const prevPriceRef = useRef(null); 
  const timerRef = useRef(null); 

  const fetchData = async (isAutoRefresh = false) => {
    if (!isAutoRefresh) setLoading(true); 
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/api/get_full_data`);
      if (!response.ok) throw new Error('网络请求失败');
      const result = await response.json();

      if (prevPriceRef.current !== null) {
        if (result.price > prevPriceRef.current) setPriceTrend('up');
        else if (result.price < prevPriceRef.current) setPriceTrend('down');
      }
      prevPriceRef.current = result.price; 

      setData(result);
      setTimeLeft(60); 
    } catch (err) {
      console.error(err);
      setError(t.error_fetch);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          fetchData(true); 
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleManualRefresh = () => {
    fetchData();
    setTimeLeft(60); 
  };

  const toggleLanguage = () => {
    setLang(prev => prev === 'zh' ? 'en' : 'zh');
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getStatusConfig = (val) => {
    if (val < 0.45) {
      return {
        label: t.status_bottom,
        subLabel: t.status_bottom_sub,
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/20',
        borderColor: 'border-emerald-500/50',
        barColor: 'bg-emerald-500',
        icon: <TrendingUp className="w-6 h-6 text-emerald-400" />,
      };
    } else if (val >= 0.45 && val < 1.2) {
      return {
        label: t.status_dca,
        subLabel: t.status_dca_sub,
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/20',
        borderColor: 'border-blue-500/50',
        barColor: 'bg-blue-500',
        icon: <Activity className="w-6 h-6 text-blue-400" />,
      };
    } else {
      return {
        label: t.status_bubble,
        subLabel: t.status_bubble_sub,
        color: 'text-rose-400',
        bgColor: 'bg-rose-500/20',
        borderColor: 'border-rose-500/50',
        barColor: 'bg-rose-500',
        icon: <AlertCircle className="w-6 h-6 text-rose-400" />,
      };
    }
  };

  const displayData = data; 
  const status = displayData ? getStatusConfig(displayData.ahr999) : getStatusConfig(0.5);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500 selection:text-white flex flex-col items-center p-4 sm:p-8">
      
      {/* 背景光效 */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen"></div>
      </div>

      <div className="max-w-4xl w-full space-y-8 pb-12">
        
        {/* 头部标题与控制区 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              {t.title}
            </h1>
            <p className="text-slate-400 text-sm mt-1">{t.subtitle}</p>
          </div>
          
          <div className="flex items-center gap-4 self-end sm:self-auto">
            {/* 倒计时 */}
            <div className="flex flex-col items-end gap-1">
               <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                 <span>{t.next_update}</span>
                 <span className="w-4 text-right">{timeLeft}s</span>
               </div>
               <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-blue-500 transition-all duration-1000 ease-linear"
                   style={{ width: `${(timeLeft / 60) * 100}%` }}
                 ></div>
               </div>
            </div>

            {/* 语言切换按钮 */}
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 text-xs font-bold text-slate-300 transition-all active:scale-95"
            >
              <Globe className="w-3.5 h-3.5" />
              {lang === 'zh' ? 'EN' : '中'}
            </button>

            {/* 刷新按钮 */}
            <button 
              onClick={handleManualRefresh} 
              disabled={loading}
              className="p-3 rounded-full bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 transition-all active:scale-95 disabled:opacity-50 group relative"
            >
              <RefreshCw className={`w-5 h-5 text-slate-300 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            </button>
          </div>
        </div>

        {/* 错误提示 */}
        {error && !data && (
           <div className="bg-rose-500/10 border border-rose-500/50 rounded-xl p-4 text-rose-200 text-sm flex items-center gap-3">
             <AlertCircle className="w-5 h-5" />
             <span>{error}</span>
           </div>
        )}

        {/* 核心内容 */}
        {loading && !data ? (
          <SkeletonLoader />
        ) : displayData ? (
          <>
            {/* 1. 指标大卡片 */}
            <div className={`relative overflow-hidden rounded-3xl border ${status.borderColor} bg-slate-900/60 backdrop-blur-xl shadow-2xl transition-all duration-500`}>
              <div className={`h-2 w-full ${status.barColor}`}></div>
              
              <div className="p-8 sm:p-12 text-center relative z-10">
                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6 ${status.bgColor} ${status.color}`}>
                  {status.icon}
                  {status.label}
                </div>
                
                <div className="flex flex-col items-center justify-center">
                  <span className="text-slate-400 text-lg uppercase tracking-widest mb-2 font-medium">AHR999</span>
                  <div className={`text-7xl sm:text-9xl font-black tracking-tighter ${status.color} drop-shadow-lg tabular-nums`}>
                    {displayData.ahr999.toFixed(3)}
                  </div>
                  <p className="text-slate-400 mt-4 max-w-lg mx-auto">
                    {status.subLabel}
                  </p>
                </div>

                <div className="mt-10 max-w-lg mx-auto relative h-4 bg-slate-800 rounded-full overflow-hidden">
                   <div className="absolute left-[20%] top-0 h-full w-0.5 bg-slate-600 z-10" title="0.45"></div>
                   <div className="absolute left-[60%] top-0 h-full w-0.5 bg-slate-600 z-10" title="1.20"></div>
                   <div 
                      className={`h-full ${status.barColor} transition-all duration-1000 ease-out`}
                      style={{ width: `${Math.min((displayData.ahr999 / 2.0) * 100, 100)}%` }}
                   ></div>
                </div>
                <div className="max-w-lg mx-auto flex justify-between text-xs text-slate-500 mt-2 font-mono">
                  <span>0</span>
                  <span className="pl-4">{t.scale_bottom}</span>
                  <span className="pl-8">{t.scale_dca}</span>
                  <span>2.0+</span>
                </div>
              </div>
            </div>

            {/* 2. 数据网格 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DataCard 
                title={t.card_price_title} 
                value={formatCurrency(displayData.price)} 
                icon={<DollarSign className="w-5 h-5 text-yellow-400" />}
                desc={t.card_price_desc}
                trend={priceTrend} 
              />
              <DataCard 
                title={t.card_cost_title} 
                value={formatCurrency(displayData.cost_200day)} 
                icon={<Activity className="w-5 h-5 text-blue-400" />}
                desc={t.card_cost_desc}
              />
              <DataCard 
                title={t.card_val_title} 
                value={formatCurrency(displayData.exp_growth_valuation)} 
                icon={<TrendingUp className="w-5 h-5 text-purple-400" />}
                desc={t.card_val_desc}
              />
            </div>

            {/* 3. 底部更新时间 */}
            <div className="text-center text-slate-500 text-sm font-mono flex items-center justify-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{t.update_time}: {displayData.update_time}</span>
            </div>

            <div className="border-t border-slate-800 my-8"></div>

            {/* 4. Bark 通知订阅功能 */}
            <BarkSubscription lang={lang} t={t} />

            {/* 5. 双向计算器 */}
            <CalculatorSection t={t} />

            {/* 6. Footer */}
            <Footer t={t} />

          </>
        ) : null}
      </div>
    </div>
  );
};

// --- 子组件定义 ---

const BarkSubscription = ({ lang, t }) => {
  const DEFAULT_URL = 'https://api.day.app/xxxxxx/';
  const [barkUrl, setBarkUrl] = useState(DEFAULT_URL);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null); 

  const handleAction = async (action) => {
    // 校验：如果用户使用的是默认链接，直接给出幽默提示，不发请求
    if (!barkUrl || barkUrl === DEFAULT_URL) {
      setMsg({ type: 'error', text: t.msg_default_url_joke });
      return;
    }

    setLoading(true);
    setMsg(null);
    
    let encodedUrl = '';
    try {
      encodedUrl = btoa(barkUrl);
    } catch (e) {
      setMsg({ type: 'error', text: t.msg_url_err });
      setLoading(false);
      return;
    }

    const endpoint = action === 'subscribe' 
      ? `${BASE_URL}/api/bark_subscribe` 
      : `${BASE_URL}/api/bark_unsubscribe`;

    const params = new URLSearchParams();
    params.append('encoded_url', encodedUrl);
    
    if (action === 'subscribe') {
      params.append('enable_quote_notif', 'true');
      params.append('quote_threshold', '1.0');
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params
      });

      if (res.status === 200) {
        setMsg({ 
          type: 'success', 
          text: action === 'subscribe' ? t.msg_sub_success : t.msg_unsub_success 
        });
      } else {
        setMsg({ type: 'error', text: `${t.msg_fail_prefix}${res.status}${t.msg_fail_suffix}` });
      }
    } catch (e) {
      setMsg({ type: 'error', text: t.msg_net_err });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 sm:p-8">
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400">
          <Bell className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-100">{t.bark_title}</h2>
          <p className="text-slate-400 text-sm mt-1">{t.bark_desc}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左侧：表单区 */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase mb-2">{t.bark_label}</label>
            <input 
              type="text" 
              value={barkUrl}
              onChange={(e) => setBarkUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono text-sm"
              placeholder="https://api.day.app/YourKey/"
            />
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => handleAction('subscribe')}
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
            >
              {loading ? t.bark_processing : t.bark_btn_sub}
            </button>
            <button 
              onClick={() => handleAction('unsubscribe')}
              disabled={loading}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-lg font-medium transition-all active:scale-95 border border-slate-700 disabled:opacity-50 disabled:active:scale-100"
            >
              {t.bark_btn_unsub}
            </button>
          </div>

          {/* 反馈信息 */}
          {msg && (
            <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
              {msg.type === 'success' ? <CheckCircle className="w-4 h-4"/> : <XCircle className="w-4 h-4"/>}
              {msg.text}
            </div>
          )}
        </div>

        {/* 右侧：说明区 */}
        <div className="bg-slate-950/50 rounded-xl p-5 border border-slate-800/50 text-sm text-slate-400">
          <div className="flex items-center gap-2 text-indigo-400 font-medium mb-3">
            <Smartphone className="w-4 h-4" />
            <span>{t.bark_help_title}</span>
          </div>
          <ol className="list-decimal list-inside space-y-2 ml-1">
            <li>
              {t.bark_help_step1} <strong>{t.bark_help_step1_app}</strong> {t.bark_help_step1_end}
            </li>
            <li>{t.bark_help_step2}</li>
            <li>{t.bark_help_step3}</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

const CalculatorSection = ({ t }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <CalculatorCard 
        title={t.calc_ahr_title}
        inputLabel={t.calc_input_price}
        defaultValue="100000"
        apiUrl={`${BASE_URL}/api/cal_ahr999`}
        paramName="price"
        resultKey="ahr999"
        icon={<Calculator className="w-5 h-5 text-blue-400" />}
        t={t}
      />
      <CalculatorCard 
        title={t.calc_price_title}
        inputLabel={t.calc_input_ahr}
        defaultValue="1.2"
        apiUrl={`${BASE_URL}/api/cal_price`}
        paramName="ahr999"
        resultKey="price"
        icon={<DollarSign className="w-5 h-5 text-purple-400" />}
        t={t}
      />
    </div>
  );
};

const CalculatorCard = ({ title, inputLabel, defaultValue, apiUrl, paramName, resultKey, icon, t }) => {
  const [val, setVal] = useState(defaultValue);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleCalc = async () => {
    setLoading(true);
    setResult(null);
    setError(false);
    try {
      const res = await fetch(`${apiUrl}?${paramName}=${val}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (res.status === 200) {
        const json = await res.json();
        setResult(json[resultKey]);
      } else {
        setError(true);
      }
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-slate-800 rounded-lg">{icon}</div>
        <h3 className="font-bold text-slate-200">{title}</h3>
      </div>
      
      <div className="space-y-4 flex-grow">
        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase mb-2">{inputLabel}</label>
          <div className="flex gap-2">
            <input 
              type="number" 
              value={val}
              onChange={(e) => setVal(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-blue-500 transition-all font-mono"
            />
            <button 
              onClick={handleCalc}
              disabled={loading}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 min-w-[80px]"
            >
              {loading ? '...' : t.calc_btn}
            </button>
          </div>
        </div>

        {/* 结果展示区 */}
        <div className="mt-4 p-4 bg-slate-950 rounded-xl border border-slate-800 min-h-[80px] flex flex-col justify-center items-center text-center">
          {error ? (
            <span className="text-rose-400 text-sm flex items-center gap-2">
              <XCircle className="w-4 h-4" /> {t.calc_fail}
            </span>
          ) : result !== null ? (
            <>
              <span className="text-slate-500 text-xs uppercase mb-1">{resultKey === 'price' ? t.calc_res_price : t.calc_res_ahr}</span>
              <span className="text-2xl font-bold text-white font-mono">
                {resultKey === 'price' 
                  ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(result)
                  : result.toFixed(4)
                }
              </span>
            </>
          ) : (
            <span className="text-slate-600 text-sm">{t.calc_click}</span>
          )}
        </div>
      </div>
    </div>
  );
};

const DataCard = ({ title, value, icon, desc, trend = 'neutral' }) => {
  let valueColor = 'text-slate-100';
  if (trend === 'up') valueColor = 'text-emerald-400';
  if (trend === 'down') valueColor = 'text-rose-400';

  return (
    <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 hover:border-slate-700 p-6 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-lg group">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
        <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-slate-700 transition-colors">
          {icon}
        </div>
      </div>
      <div className={`text-2xl font-bold transition-colors duration-500 ${valueColor}`}>
        {value}
      </div>
      <div className="text-xs text-slate-500 mt-1">{desc}</div>
    </div>
  );
};

const Footer = ({ t }) => (
  <div className="border-t border-slate-800 pt-8 flex flex-col items-center gap-4 text-slate-500">
    <div className="flex items-center gap-6">
      <a 
        href="https://github.com/HakuYuri/ahr999_api_server" 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-2 hover:text-white transition-colors text-sm"
      >
        <Github className="w-4 h-4" />
        <span>{t.footer_github}</span>
        <ExternalLink className="w-3 h-3 opacity-50" />
      </a>
    </div>
    <p className="text-xs opacity-50">
      {t.footer_disclaimer}
    </p>
  </div>
);

const SkeletonLoader = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-[400px] w-full bg-slate-800/50 rounded-3xl"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="h-32 bg-slate-800/50 rounded-2xl"></div>
      <div className="h-32 bg-slate-800/50 rounded-2xl"></div>
      <div className="h-32 bg-slate-800/50 rounded-2xl"></div>
    </div>
  </div>
);

export default App;
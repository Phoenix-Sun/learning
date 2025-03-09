import { useState, useEffect, useRef } from 'react';

/**
 * 計時條組件
 * 用於顯示一個計時條，讓玩家在特定時間點點擊
 * @param {number} duration - 計時條持續時間（毫秒）
 * @param {function} onComplete - 計時結束後的回調函數
 * @param {function} onSuccess - 玩家成功點擊後的回調函數
 * @param {string} type - 計時條類型 ("shooting" 或 "defense")
 */
const TimerBar = ({ duration = 5000, onComplete, onSuccess, type = "shooting" }) => {
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [isActive, setIsActive] = useState(true);
  const [showAnimation, setShowAnimation] = useState(false);
  const requestRef = useRef(null);
  const startTimeRef = useRef(null);
  
  // 成功區間範圍 (%), 根據類型調整難度
  const successZoneStart = type === "shooting" ? 30 : 25;
  const successZoneEnd = type === "shooting" ? 70 : 75;
  
  // 開始計時動畫
  useEffect(() => {
    const startAnimation = (timestamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }
      
      const elapsed = timestamp - startTimeRef.current;
      const newProgress = Math.min(100, (elapsed / duration) * 100);
      setProgress(newProgress);
      
      if (newProgress < 100) {
        requestRef.current = requestAnimationFrame(startAnimation);
      } else {
        setIsActive(false);
        if (onComplete) onComplete(result || false);
      }
    };
    
    requestRef.current = requestAnimationFrame(startAnimation);
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [duration, onComplete, result]);
  
  // 處理點擊事件
  const handleClick = () => {
    if (!isActive) return;
    
    // 檢查是否點擊在成功區間
    const isSuccess = progress >= successZoneStart && progress <= successZoneEnd;
    setResult(isSuccess);
    setShowAnimation(true);
    
    // 顯示動畫後自動隱藏
    setTimeout(() => {
      setShowAnimation(false);
    }, 1000);
    
    if (onSuccess) onSuccess(isSuccess);
    
    // 停止動畫
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    
    setIsActive(false);
    if (onComplete) onComplete(isSuccess);
  };

  // 獲取動作文字
  const getActionText = () => {
    if (type === "shooting") {
      return isActive ? "投籃" : result ? "完美投籃!" : "投籃失敗!";
    } else {
      return isActive ? "防守" : result ? "精彩防守!" : "防守失敗!";
    }
  };
  
  return (
    <div 
      className="timer-bar-container"
      style={{
        width: '100%',
        maxWidth: '400px',
        margin: '20px auto',
        textAlign: 'center',
        position: 'relative'
      }}
    >
      <h3 style={{ color: type === "shooting" ? '#e74c3c' : '#3498db' }}>
        {type === "shooting" ? "投籃時機" : "防守時機"}
      </h3>
      <p style={{ fontWeight: 'bold' }}>{isActive ? "點擊綠色區域獲得最佳效果！" : result ? "成功！" : "失敗！"}</p>
      
      {/* 成功/失敗動畫效果 */}
      {showAnimation && (
        <div className="result-animation" style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '28px',
          fontWeight: 'bold',
          color: result ? '#27ae60' : '#e74c3c',
          animation: 'fadeInOut 1s ease-in-out',
          zIndex: 10,
          textShadow: '0 0 5px #fff',
          backgroundColor: 'rgba(255,255,255,0.8)',
          padding: '10px 20px',
          borderRadius: '10px'
        }}>
          {result ? '完美！' : '可惜！'}
        </div>
      )}
      
      <div 
        className="timer-bar"
        style={{
          width: '100%',
          height: '30px',
          backgroundColor: '#eee',
          borderRadius: '15px',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.1)'
        }}
      >
        {/* 成功區間 */}
        <div 
          className="success-zone"
          style={{
            position: 'absolute',
            left: `${successZoneStart}%`,
            width: `${successZoneEnd - successZoneStart}%`,
            height: '100%',
            backgroundColor: '#4CAF50',
            zIndex: 1,
            boxShadow: 'inset 0 0 10px rgba(255,255,255,0.5)'
          }}
        />
        
        {/* 進度條 */}
        <div 
          className="progress"
          style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: type === "shooting" ? '#e74c3c' : '#3498db',
            transition: 'width 0.1s linear',
            zIndex: 2,
            position: 'relative',
            boxShadow: 'inset 0 0 10px rgba(255,255,255,0.3)'
          }}
        />
        
        {/* 指示標記 */}
        <div
          className="marker"
          style={{
            position: 'absolute',
            left: `${progress}%`,
            top: '0',
            height: '100%',
            width: '2px',
            backgroundColor: '#fff',
            zIndex: 3,
            display: isActive ? 'block' : 'none'
          }}
        />
      </div>
      
      <button 
        className="action-button"
        onClick={handleClick}
        disabled={!isActive}
        style={{
          padding: '12px 30px',
          marginTop: '15px',
          fontSize: '16px',
          backgroundColor: isActive ? (type === "shooting" ? '#e74c3c' : '#3498db') : '#ccc',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: isActive ? 'pointer' : 'default',
          boxShadow: isActive ? '0 2px 5px rgba(0,0,0,0.2)' : 'none',
          transition: 'all 0.2s ease'
        }}
      >
        {getActionText()}
      </button>
    </div>
  );
};

export default TimerBar;
import { useState, useEffect, useRef } from 'react';

/**
 * 蓋火鍋動作組件
 * 實現上下移動的動畫，玩家需要在特定時機點擊
 * @param {number} duration - 動畫持續時間（毫秒）
 * @param {function} onComplete - 完成後的回調函數
 */
const BlockingBar = ({ duration = 5000, onComplete }) => {
  const [position, setPosition] = useState(50); // 球的位置（0-100）
  const [direction, setDirection] = useState(1); // 移動方向（1向上，-1向下）
  const [isActive, setIsActive] = useState(true);
  const [result, setResult] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const requestRef = useRef(null);
  const startTimeRef = useRef(null);
  const lastTimeRef = useRef(null);
  
  // 成功區間範圍 (%), 在頂部和底部附近
  const successZoneTop = [0, 20]; // 頂部成功區間
  const successZoneBottom = [80, 100]; // 底部成功區間
  
  // 開始動畫
  useEffect(() => {
    // 移動速度因子（每毫秒移動百分比）
    const speedFactor = 0.05;
    
    const animate = (timestamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
        lastTimeRef.current = timestamp;
      }
      
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;
      
      // 更新球的位置
      setPosition(prevPosition => {
        let newPos = prevPosition + direction * speedFactor * deltaTime;
        
        // 碰到邊界時改變方向
        if (newPos >= 100) {
          newPos = 100;
          setDirection(-1);
        } else if (newPos <= 0) {
          newPos = 0;
          setDirection(1);
        }
        
        return newPos;
      });
      
      // 檢查是否結束動畫
      const elapsedTime = timestamp - startTimeRef.current;
      if (elapsedTime < duration && isActive) {
        requestRef.current = requestAnimationFrame(animate);
      } else if (isActive) {
        // 時間到但用戶沒有操作，視為失敗
        setIsActive(false);
        if (onComplete) {
          onComplete(false);
        }
      }
    };
    
    // 開始動畫循環
    requestRef.current = requestAnimationFrame(animate);
    
    // 清理函數
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [duration, onComplete, direction, isActive]);
  
  // 處理點擊事件
  const handleClick = () => {
    if (!isActive) return;
    
    // 檢查是否在成功區間（頂部或底部）
    const isSuccessTop = position >= successZoneTop[0] && position <= successZoneTop[1];
    const isSuccessBottom = position >= successZoneBottom[0] && position <= successZoneBottom[1];
    const isSuccess = isSuccessTop || isSuccessBottom;
    
    setResult(isSuccess);
    setShowAnimation(true);
    
    // 顯示動畫後自動隱藏
    setTimeout(() => {
      setShowAnimation(false);
    }, 1000);
    
    // 停止動畫
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    
    setIsActive(false);
    if (onComplete) {
      onComplete(isSuccess);
    }
  };

  return (
    <div 
      className="blocking-bar-container"
      style={{
        width: '100%',
        maxWidth: '400px',
        margin: '20px auto',
        textAlign: 'center',
        position: 'relative'
      }}
    >
      <h3 style={{ color: '#3498db' }}>
        蓋火鍋時機
      </h3>
      <p style={{ fontWeight: 'bold' }}>
        {isActive 
          ? "當球在頂部或底部綠色區域時點擊獲得最佳效果！" 
          : result === true ? "成功封蓋！" : "封蓋失敗！"}
      </p>
      
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
          {result ? '完美封蓋！' : '可惜！'}
        </div>
      )}
      
      <div 
        className="blocking-bar"
        style={{
          width: '60px',
          height: '300px',
          backgroundColor: '#eee',
          borderRadius: '5px',
          margin: '0 auto',
          position: 'relative',
          boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}
      >
        {/* 頂部成功區間 */}
        <div 
          className="success-zone-top"
          style={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: `${successZoneTop[1]}%`,
            backgroundColor: '#4CAF50',
            borderTopLeftRadius: '5px',
            borderTopRightRadius: '5px',
            zIndex: 1
          }}
        />
        
        {/* 底部成功區間 */}
        <div 
          className="success-zone-bottom"
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            width: '100%',
            height: `${100 - successZoneBottom[0]}%`,
            backgroundColor: '#4CAF50',
            borderBottomLeftRadius: '5px',
            borderBottomRightRadius: '5px',
            zIndex: 1
          }}
        />
        
        {/* 籃球 */}
        <div 
          className="basketball"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#e67e22',
            backgroundImage: 'radial-gradient(circle at 15px 15px, #f39c12, #e67e22)',
            border: '2px solid #d35400',
            position: 'absolute',
            top: `calc(${position}% - 20px)`,
            left: '10px',
            zIndex: 2,
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
          }}
        />
        
        {/* 指示線 */}
        <div 
          className="target-line"
          style={{
            position: 'absolute',
            width: '100%',
            height: '2px',
            backgroundColor: '#3498db',
            top: 'calc(50% - 1px)',
            zIndex: 1,
            opacity: 0.5
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
          backgroundColor: isActive ? '#3498db' : '#ccc',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: isActive ? 'pointer' : 'default',
          boxShadow: isActive ? '0 2px 5px rgba(0,0,0,0.2)' : 'none',
          transition: 'all 0.2s ease'
        }}
      >
        蓋火鍋
      </button>
    </div>
  );
};

export default BlockingBar;
import React, { useState } from 'react';

/**
 * 遊戲日誌組件
 * 顯示比賽過程中的事件記錄
 */
const GameLog = ({ gameLog }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 格式化時間為分鐘：秒
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // 如果沒有日誌，則不顯示
  if (gameLog.length === 0) return null;
  
  // 只顯示最新的 3 條記錄，除非展開查看全部
  const displayedLogs = isExpanded ? gameLog : gameLog.slice(-3);
  
  return (
    <div className="game-log" style={{ 
      marginTop: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      padding: '15px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '10px',
        borderBottom: '1px solid #eee',
        paddingBottom: '5px'
      }}>
        <h4 style={{ margin: 0, color: '#2c3e50' }}>比賽記錄</h4>
        
        {gameLog.length > 3 && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#3498db',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            {isExpanded ? (
              <>
                收起 <span style={{ fontSize: '10px' }}>▲</span>
              </>
            ) : (
              <>
                查看全部 ({gameLog.length}) <span style={{ fontSize: '10px' }}>▼</span>
              </>
            )}
          </button>
        )}
      </div>
      
      <div style={{ 
        maxHeight: isExpanded ? '300px' : '150px',
        overflowY: 'auto',
        transition: 'max-height 0.3s ease'
      }}>
        {displayedLogs.map((log, index) => (
          <div 
            key={index} 
            style={{
              padding: '8px 10px',
              borderBottom: index < displayedLogs.length - 1 ? '1px solid #eee' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              animation: index === displayedLogs.length - 1 && !isExpanded ? 'fadeIn 0.5s ease-in-out' : 'none'
            }}
          >
            <span style={{
              backgroundColor: '#e8f4f8',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#3498db',
              minWidth: '40px',
              textAlign: 'center'
            }}>
              {formatTime(log.time)}
            </span>
            
            <span style={{ fontSize: '14px', flexGrow: 1 }}>
              {log.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameLog;
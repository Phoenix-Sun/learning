import React from 'react';

/**
 * 遊戲結果顯示組件
 * 用於顯示每個動作的結果
 */
const GameResult = ({ actionResult }) => {
  if (!actionResult) return null;
  
  return (
    <div className="result" style={{ 
      marginTop: '20px', 
      padding: '15px', 
      backgroundColor: actionResult.points > 0 ? '#d4edda' : actionResult.opponentPoints > 0 ? '#f8d7da' : '#fff3cd',
      color: actionResult.points > 0 ? '#155724' : actionResult.opponentPoints > 0 ? '#721c24' : '#856404',
      borderRadius: '5px',
      textAlign: 'center',
      fontWeight: 'bold',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      animation: 'fadeIn 0.5s ease-in-out'
    }}>
      <p style={{ fontSize: '18px' }}>{actionResult.description}</p>
      
      {/* 顯示得分變化 */}
      {(actionResult.points > 0 || actionResult.opponentPoints > 0) && (
        <div style={{ 
          marginTop: '10px',
          display: 'flex',
          justifyContent: 'center',
          gap: '20px'
        }}>
          {actionResult.points > 0 && (
            <div style={{ 
              backgroundColor: 'rgba(255,255,255,0.7)',
              padding: '5px 10px',
              borderRadius: '5px',
              fontWeight: 'bold'
            }}>
              我隊 +{actionResult.points}
            </div>
          )}
          {actionResult.opponentPoints > 0 && (
            <div style={{ 
              backgroundColor: 'rgba(255,255,255,0.7)',
              padding: '5px 10px',
              borderRadius: '5px',
              fontWeight: 'bold'
            }}>
              對手 +{actionResult.opponentPoints}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GameResult;
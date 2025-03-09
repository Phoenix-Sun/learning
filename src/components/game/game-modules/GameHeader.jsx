import React from 'react';

/**
 * 遊戲頭部信息組件
 * 顯示比賽狀態、時間、比分等
 */
const GameHeader = ({ 
  gameState, 
  gameTime, 
  gameAction, 
  opponent, 
  teamScore, 
  opponentScore
}) => {
  // 格式化時間為分鐘：秒
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="game-header" style={{ 
      marginBottom: '20px', 
      textAlign: 'center',
      backgroundColor: gameState === 'critical' ? '#fff8f8' : '#fff',
      borderRadius: '10px',
      padding: '15px',
      boxShadow: gameState === 'critical' ? '0 0 15px rgba(231, 76, 60, 0.3)' : '0 0 10px rgba(0,0,0,0.1)',
      animation: gameState === 'critical' ? 'pulse 2s infinite' : 'none'
    }}>
      <h2>第四節比賽</h2>
      {opponent && <h3>對陣: {opponent.name}</h3>}
      
      {(teamScore !== undefined && opponentScore !== undefined) && (
        <div className="score-display" style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: '20px', 
          marginTop: '15px' 
        }}>
          <div>
            <p>我隊</p>
            <h2>{teamScore}</h2>
          </div>
          <div>
            <p>比分</p>
            <h2>-</h2>
          </div>
          <div>
            <p>{opponent ? opponent.name : '對手'}</p>
            <h2>{opponentScore}</h2>
          </div>
        </div>
      )}
      
      <div className="time-display" style={{ 
        marginTop: '15px',
        backgroundColor: gameState === 'critical' ? '#f8d7da' : '#e8f4f8',
        display: 'inline-block',
        padding: '8px 20px',
        borderRadius: '5px',
        fontWeight: 'bold'
      }}>
        <p>剩餘時間: <span style={{ 
          fontWeight: 'bold', 
          color: gameState === 'critical' ? '#e74c3c' : '#3498db',
          fontSize: '20px'
        }}>{formatTime(gameTime)}</span></p>
      </div>
      
      {gameAction && (
        <div style={{ marginTop: '10px' }}>
          <p>當前: <span style={{ 
            fontWeight: 'bold', 
            color: gameAction === 'offense' ? '#e74c3c' : '#3498db' 
          }}>
            {gameAction === 'offense' ? '進攻' : '防守'}
          </span></p>
        </div>
      )}
      
      {gameState === 'critical' && (
        <div style={{ 
          marginTop: '10px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '5px 10px',
          borderRadius: '5px',
          fontWeight: 'bold',
          animation: 'pulse 1.5s infinite'
        }}>
          關鍵時刻！
        </div>
      )}
    </div>
  );
};

export default GameHeader;
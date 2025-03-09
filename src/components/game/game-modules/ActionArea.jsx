import React from 'react';

/**
 * 操作區域組件
 * 包含開始操作按鈕和暫停遊戲按鈕
 */
const ActionArea = ({ 
  gameAction, 
  selectedPlayerId, 
  selectedSkillId, 
  onStartAction, 
  onTogglePause, 
  isPaused 
}) => {
  return (
    <div className="action-area" style={{ 
      padding: '20px', 
      backgroundColor: '#f8f9fa',
      borderRadius: '10px',
      marginBottom: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <button 
        onClick={onStartAction}
        disabled={!selectedPlayerId}
        style={{
          padding: '12px 30px',
          fontSize: '16px',
          backgroundColor: !selectedPlayerId ? '#ccc' : (gameAction === 'offense' ? '#e74c3c' : '#3498db'),
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: selectedPlayerId ? 'pointer' : 'not-allowed',
          fontWeight: 'bold',
          flexGrow: 1,
          marginRight: '10px'
        }}
      >
        {gameAction === 'offense' ? '開始進攻' : '開始防守'}
      </button>
      
      <button 
        onClick={onTogglePause}
        style={{
          padding: '12px 15px',
          fontSize: '16px',
          backgroundColor: isPaused ? '#27ae60' : '#f39c12',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {isPaused ? (
          <span style={{ fontWeight: 'bold' }}>繼續 ▶</span>
        ) : (
          <span style={{ fontWeight: 'bold' }}>暫停 II</span>
        )}
      </button>
    </div>
  );
};

export default ActionArea;
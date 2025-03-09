import React from 'react';

/**
 * 球員卡片組件
 * @param {Object} player - 球員數據對象
 * @param {Function} onSelect - 選擇球員的回調函數
 * @param {Boolean} isSelected - 是否被選中
 */
const PlayerCard = ({ player, onSelect, isSelected }) => {
  const handleClick = () => {
    onSelect(player.id);
  };

  return (
    <div 
      className="player-card" 
      onClick={handleClick}
      style={{
        width: '140px',
        padding: '15px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        backgroundColor: isSelected ? '#e8f4f8' : 'white',
        border: isSelected ? '2px solid #3498db' : '1px solid #eee',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
        margin: '10px'
      }}
    >
      {isSelected && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: '#3498db',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          ✓
        </div>
      )}
      
      <h3 style={{ marginTop: '5px', marginBottom: '10px', color: '#2c3e50', textAlign: 'center' }}>
        {player.name}
      </h3>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div>
          <div style={{ 
            fontSize: '12px', 
            color: '#7f8c8d', 
            marginBottom: '2px' 
          }}>
            攻擊
          </div>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: 'bold', 
            color: '#e74c3c' 
          }}>
            {player.attackValue}
          </div>
        </div>
        <div>
          <div style={{ 
            fontSize: '12px', 
            color: '#7f8c8d', 
            marginBottom: '2px' 
          }}>
            防守
          </div>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: 'bold', 
            color: '#3498db' 
          }}>
            {player.defenseValue}
          </div>
        </div>
      </div>
      
      <div style={{ 
        backgroundColor: isSelected ? '#d6eaf8' : '#f7f9f9',
        padding: '5px',
        borderRadius: '5px',
        marginTop: '8px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '12px', color: '#7f8c8d', marginBottom: '2px' }}>
          技能ID
        </div>
        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#8e44ad' }}>
          {player.skillId}
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;
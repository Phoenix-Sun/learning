import React from 'react';

/**
 * 技能卡片組件
 * @param {Object} skill - 技能數據對象
 * @param {Function} onSelect - 選擇技能的回調函數
 * @param {Boolean} isSelected - 是否被選中
 * @param {Boolean} isDisabled - 是否被禁用（已使用過的技能）
 */
const SkillCard = ({ skill, onSelect, isSelected, isDisabled }) => {
  const handleClick = () => {
    if (!isDisabled) {
      onSelect(skill.id);
    }
  };

  // 根據技能類型獲取顏色
  const getEffectColor = (effectType) => {
    switch (effectType) {
      case 'increase_hit_rate':
        return '#e74c3c';
      case 'increase_defense_rate':
        return '#3498db';
      case 'add_score':
        return '#27ae60';
      default:
        return '#7f8c8d';
    }
  };

  // 獲取技能效果描述
  const getEffectDescription = (effectType, effectValue) => {
    switch (effectType) {
      case 'increase_hit_rate':
        return `提高命中率 +${effectValue}%`;
      case 'increase_defense_rate':
        return `提高防守率 +${effectValue}%`;
      case 'add_score':
        return `額外得分 +${effectValue}`;
      default:
        return `效果值 +${effectValue}`;
    }
  };

  return (
    <div 
      className="skill-card" 
      onClick={handleClick}
      style={{
        width: '200px',
        padding: '15px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        backgroundColor: isDisabled ? '#f5f5f5' : isSelected ? '#fff8e1' : 'white',
        border: isSelected ? '2px solid #f39c12' : '1px solid #eee',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
        margin: '10px',
        opacity: isDisabled ? 0.6 : 1
      }}
    >
      {isSelected && !isDisabled && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: '#f39c12',
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
      
      {isDisabled && (
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#7f8c8d'
        }}>
          已使用
        </div>
      )}
      
      <h3 style={{ 
        marginTop: '5px', 
        marginBottom: '15px', 
        color: getEffectColor(skill.effectType),
        textAlign: 'center' 
      }}>
        {skill.name}
      </h3>
      
      <div style={{ 
        backgroundColor: isDisabled ? '#eee' : '#f7f9f9',
        padding: '8px',
        borderRadius: '5px',
        marginTop: '10px',
        textAlign: 'center'
      }}>
        <div style={{ 
          fontSize: '14px', 
          fontWeight: 'bold',
          color: isDisabled ? '#95a5a6' : getEffectColor(skill.effectType) 
        }}>
          {getEffectDescription(skill.effectType, skill.effectValue)}
        </div>
      </div>
    </div>
  );
};

export default SkillCard;
import React, { useEffect, useState } from 'react';
import PlayerCard from './PlayerCard';
import SkillCard from './SkillCard';

/**
 * 選擇區域組件，包含球員和技能選擇
 * @param {Array} players - 所有球員數據
 * @param {Array} skills - 所有技能數據
 * @param {String} selectedPlayerId - 已選擇的球員ID
 * @param {String} selectedSkillId - 已選擇的技能ID
 * @param {Array} usedSkills - 已使用的技能ID列表
 * @param {Function} onPlayerSelect - 選擇球員的回調函數
 * @param {Function} onSkillSelect - 選擇技能的回調函數
 * @param {String} gameAction - 當前遊戲動作（'offense'或'defense'）
 */
const SelectionArea = ({ 
  players, 
  skills, 
  selectedPlayerId, 
  selectedSkillId, 
  usedSkills, 
  onPlayerSelect, 
  onSkillSelect,
  gameAction
}) => {
  const [availableSkills, setAvailableSkills] = useState([]);

  // 當選擇球員變化時，更新可用技能
  useEffect(() => {
    if (selectedPlayerId) {
      const player = players.find(p => p.id === selectedPlayerId);
      if (player) {
        const playerSkill = skills.find(s => s.id === player.skillId);
        if (playerSkill) {
          setAvailableSkills([playerSkill]);
        } else {
          setAvailableSkills([]);
        }
      }
    } else {
      setAvailableSkills([]);
    }
  }, [selectedPlayerId, players, skills]);

  // 根據當前遊戲動作過濾球員
  const filteredPlayers = players.filter(player => {
    if (gameAction === 'offense') {
      return player.attackValue >= 75; // 進攻需要較高的攻擊值
    } else {
      return player.defenseValue >= 75; // 防守需要較高的防守值
    }
  }).sort((a, b) => {
    // 根據當前動作排序球員
    if (gameAction === 'offense') {
      return b.attackValue - a.attackValue;
    } else {
      return b.defenseValue - a.defenseValue;
    }
  });

  return (
    <div className="selection-area">
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ 
          color: gameAction === 'offense' ? '#e74c3c' : '#3498db',
          marginBottom: '15px'
        }}>
          {gameAction === 'offense' ? '選擇進攻球員' : '選擇防守球員'}
        </h3>
        
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '12px', 
          justifyContent: 'center' 
        }}>
          {filteredPlayers.map(player => (
            <PlayerCard 
              key={player.id}
              player={player}
              onSelect={onPlayerSelect}
              isSelected={selectedPlayerId === player.id}
            />
          ))}
        </div>
      </div>
      
      {selectedPlayerId && (
        <div style={{ marginTop: '30px', marginBottom: '20px' }}>
          <h3 style={{ 
            color: '#8e44ad',
            marginBottom: '15px'
          }}>
            可用技能
          </h3>
          
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '15px', 
            justifyContent: 'center'
          }}>
            {availableSkills.length > 0 ? (
              availableSkills.map(skill => (
                <SkillCard 
                  key={skill.id}
                  skill={skill}
                  onSelect={onSkillSelect}
                  isSelected={selectedSkillId === skill.id}
                  isDisabled={usedSkills.includes(skill.id)}
                />
              ))
            ) : (
              <div style={{ 
                padding: '20px', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '10px',
                textAlign: 'center',
                color: '#7f8c8d',
                width: '100%',
                maxWidth: '400px'
              }}>
                此球員沒有可用技能或技能已使用
              </div>
            )}
          </div>
        </div>
      )}
      
      <div style={{ 
        textAlign: 'center', 
        marginTop: '25px',
        padding: '15px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px'
      }}>
        <p style={{ fontSize: '14px', color: '#7f8c8d' }}>
          {gameAction === 'offense' 
            ? '提示: 選擇進攻能力強的球員將提高得分機率' 
            : '提示: 選擇防守能力強的球員將提高阻止對手得分的機率'}
        </p>
      </div>
    </div>
  );
};

export default SelectionArea;
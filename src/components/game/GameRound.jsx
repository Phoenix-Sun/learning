import { useState, useEffect } from 'react';
import TimerBar from './TimerBar';
import { getPlayerSkill } from '../../utils/dataLoader';

/**
 * 比賽回合組件
 * 處理單個比賽回合，包括玩家選擇和行動
 * @param {Object} props - 組件屬性
 * @param {number} props.round - 當前回合數（1-3）
 * @param {string} props.type - 回合類型（"offense"、"defense" 或 "choice"）
 * @param {Array} props.players - 球員數據數組
 * @param {Array} props.skills - 技能數據數組
 * @param {Array} props.usedSkills - 已使用技能ID數組
 * @param {function} props.onRoundComplete - 回合完成後的回調函數
 * @param {Object} props.opponent - 對手數據
 */
const GameRound = ({ 
  round, 
  type = "offense", 
  players, 
  skills, 
  usedSkills = [], 
  onRoundComplete,
  opponent 
}) => {
  // 狀態
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [roundType, setRoundType] = useState(type);
  const [showTimer, setShowTimer] = useState(false);
  const [roundResult, setRoundResult] = useState(null);
  const [message, setMessage] = useState('');
  const [playerStats, setPlayerStats] = useState(null);
  
  // 如果是選擇回合，讓玩家選擇進攻或防守
  useEffect(() => {
    if (type === 'choice') {
      setMessage('請選擇本回合進行進攻或防守');
    } else {
      setRoundType(type);
      setMessage(type === 'offense' ? '選擇一名球員進行進攻' : '選擇防守策略');
    }
  }, [type]);
  
  // 處理玩家選擇
  const handlePlayerSelect = (e) => {
    setSelectedPlayerId(Number(e.target.value));
  };
  
  // 處理技能選擇
  const handleSkillSelect = (e) => {
    setSelectedSkillId(Number(e.target.value));
  };
  
  // 處理進攻/防守選擇
  const handleTypeSelect = (selectedType) => {
    setRoundType(selectedType);
    setMessage(selectedType === 'offense' ? '選擇一名球員進行進攻' : '選擇防守策略');
  };
  
  // 處理回合開始
  const handleStartAction = () => {
    if (roundType === 'offense' && !selectedPlayerId) {
      setMessage('請選擇一名球員');
      // 增加警告效果
      const playerSelect = document.getElementById('player-select');
      if (playerSelect) {
        playerSelect.style.border = '2px solid #e74c3c';
        setTimeout(() => {
          playerSelect.style.border = '1px solid #ddd';
        }, 1500);
      }
      return;
    }
    
    // 添加遊戲受到防守或進攻的說明
    let preparationMessage = '';
    if (roundType === 'offense') {
      const player = players.find(p => p.id === selectedPlayerId);
      preparationMessage = player ? `${player.name}準備進攻...` : '準備進攻...';
    } else {
      preparationMessage = '防守準備就緒...';
    }
    
    setMessage(preparationMessage);
    
    // 添加延遲使遊戲更真實
    setTimeout(() => {
      setShowTimer(true);
    }, 800);
  };
  
  // 處理計時條完成
  const handleTimerComplete = (success) => {
    // 計算結果
    let points = 0;
    let opponentPoints = 0;
    let description = '';
    let stats = {};
    
    if (roundType === 'offense') {
      // 獲取選擇的球員
      const player = selectedPlayerId ? players.find(p => p.id === selectedPlayerId) : null;
      
      // 基礎命中率 - 根據球員能力調整
      let baseHitRate = player ? 40 + Math.floor(player.attackValue / 5) : 40;
      
      // 調整基礎命中率，使其不會過高或過低
      baseHitRate = Math.max(30, Math.min(baseHitRate, 65));
      
      // 初始化當前命中率
      let hitRate = baseHitRate;
      
      // 技能效果
      let skillBonus = 0;
      let skillDescription = '';
      
      // 如果選擇了技能，應用技能效果
      if (selectedSkillId) {
        const skill = skills.find(s => s.id === selectedSkillId);
        if (skill) {
          if (skill.effectType === 'increase_hit_rate') {
            skillBonus = skill.effectValue;
            hitRate += skillBonus;
            skillDescription = `${skill.name}技能提高了${skillBonus}%命中率！`;
          }
        }
      }
      
      // 計時條成功增加命中率
      let timerBonus = success ? 25 : 0;
      hitRate += timerBonus;
      
      // 對手防守值降低命中率
      let defenseReduction = Math.floor(opponent.defenseValue / 8);
      hitRate -= defenseReduction;
      
      // 確保命中率在合理範圍內
      hitRate = Math.max(15, Math.min(hitRate, 90));
      
      // 計算得分機率
      const randomValue = Math.random() * 100;
      const isHit = randomValue < hitRate;
      
      // 是否為三分球
      const isThreePointer = Math.random() < 0.3;
      
      // 統計數據
      stats = {
        player: player ? player.name : '未知球員',
        baseHitRate: baseHitRate,
        skillBonus: skillBonus,
        timerBonus: timerBonus,
        defenseReduction: defenseReduction,
        finalHitRate: hitRate,
        shot: isHit ? (isThreePointer ? '三分球' : '投籃') : '未命中',
        shotDescription: isHit ? `${randomValue.toFixed(1)}% < ${hitRate.toFixed(1)}%` : `${randomValue.toFixed(1)}% > ${hitRate.toFixed(1)}%`
      };
      
      if (isHit) {
        // 確定得分
        if (isThreePointer) {
          points = 3;
          description = `三分球命中！得到${points}分`;
        } else {
          points = 2;
          description = `投籃命中！得到${points}分`;
        }
        
        // 如果有增加得分的技能
        if (selectedSkillId) {
          const skill = skills.find(s => s.id === selectedSkillId);
          if (skill && skill.effectType === 'add_score') {
            const extraPoints = skill.effectValue;
            points += extraPoints;
            description = `${skill.name}技能發動！${description.replace(/\d+分$/, '')}${points}分`;
          }
        }
      } else {
        description = '投籃未命中！';
        
        // 小概率對手搶到籃板得分
        if (Math.random() < 0.2) {
          opponentPoints = Math.floor(Math.random() * 2) + 1; // 1-2分
          description += ` 對手搶到籃板得到${opponentPoints}分。`;
        }
      }
      
      // 如果有技能描述，在結果前加上技能效果
      if (skillDescription) {
        description = `${skillDescription} ${description}`;
      }
      
      setPlayerStats(stats);
      setRoundResult({
        points,
        opponentPoints,
        description
      });
    } else { // 防守回合
      // 基礎防守成功率
      let baseDefenseRate = 45;
      
      // 技能效果
      let skillBonus = 0;
      let skillDescription = '';
      
      // 如果選擇了技能，應用技能效果
      if (selectedSkillId) {
        const skill = skills.find(s => s.id === selectedSkillId);
        if (skill && skill.effectType === 'increase_defense_rate') {
          skillBonus = skill.effectValue;
          baseDefenseRate += skillBonus;
          skillDescription = `${skill.name}技能提高了${skillBonus}%防守成功率！`;
        }
      }
      
      // 計時條成功增加防守成功率
      let timerBonus = success ? 30 : 0;
      let defenseRate = baseDefenseRate + timerBonus;
      
      // 對手攻擊值降低防守成功率
      let attackReduction = Math.floor(opponent.attackValue / 8);
      defenseRate -= attackReduction;
      
      // 確保防守成功率在合理範圍內
      defenseRate = Math.max(15, Math.min(defenseRate, 90));
      
      // 計算防守結果
      const randomValue = Math.random() * 100;
      const isDefenseSuccess = randomValue < defenseRate;
      
      // 統計數據
      stats = {
        baseDefenseRate: baseDefenseRate,
        skillBonus: skillBonus,
        timerBonus: timerBonus,
        attackReduction: attackReduction,
        finalDefenseRate: defenseRate,
        result: isDefenseSuccess ? '防守成功' : '防守失敗',
        resultDescription: isDefenseSuccess ? `${randomValue.toFixed(1)}% < ${defenseRate.toFixed(1)}%` : `${randomValue.toFixed(1)}% > ${defenseRate.toFixed(1)}%`
      };
      
      if (isDefenseSuccess) {
        description = '防守成功！攔截了對手的進攻';
        
        // 小概率搶斷反擊得分
        if (Math.random() < 0.3) {
          points = Math.floor(Math.random() * 2) + 1; // 1-2分
          description += ` 你快速反擊得到${points}分。`;
        }
      } else {
        // 對手得分
        const isThreePointer = Math.random() < 0.25;
        
        if (isThreePointer) {
          opponentPoints = 3;
          description = `防守失敗！對手三分球命中得到${opponentPoints}分`;
        } else {
          opponentPoints = 2;
          description = `防守失敗！對手得到${opponentPoints}分`;
        }
      }
      
      // 如果有技能描述，在結果前加上技能效果
      if (skillDescription) {
        description = `${skillDescription} ${description}`;
      }
      
      setPlayerStats(stats);
      setRoundResult({
        points,
        opponentPoints,
        description
      });
    }
    
    // 延遲一下顯示結果，然後結束回合
    setTimeout(() => {
      if (onRoundComplete) {
        onRoundComplete({
          round,
          type: roundType,
          usedSkill: selectedSkillId || null,
          points: roundResult ? roundResult.points : points,
          opponentPoints: roundResult ? roundResult.opponentPoints : opponentPoints,
          description: roundResult ? roundResult.description : description
        });
      }
    }, 2500);
  };
  
  // 獲取玩家當前可用的技能
  const getAvailableSkills = () => {
    if (!selectedPlayerId) return [];
    
    const player = players.find(p => p.id === selectedPlayerId);
    if (!player) return [];
    
    const skill = skills.find(s => s.id === player.skillId);
    if (!skill || usedSkills.includes(skill.id)) return [];
    
    return [skill];
  };
  
  const availableSkills = getAvailableSkills();
  
  // 顯示計時條
  if (showTimer) {
    return (
      <div className="game-round" style={{ position: 'relative', padding: '20px', maxWidth: '600px', margin: '0 auto', textAlign: 'center', backgroundColor: '#f8f9fa', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h3 style={{ color: roundType === 'offense' ? '#e74c3c' : '#3498db' }}>
          第{round}回合 - {roundType === 'offense' ? '進攻' : '防守'}
        </h3>
        
        <TimerBar 
          type={roundType === 'offense' ? 'shooting' : 'defense'} 
          onComplete={handleTimerComplete}
        />
        
        {roundResult && (
          <div className="round-result" style={{ 
            marginTop: '20px', 
            padding: '15px', 
            backgroundColor: roundResult.points > 0 ? '#d4edda' : roundResult.opponentPoints > 0 ? '#f8d7da' : '#fff3cd',
            borderRadius: '5px',
            color: roundResult.points > 0 ? '#155724' : roundResult.opponentPoints > 0 ? '#721c24' : '#856404',
          }}>
            <h4>回合結果</h4>
            <p style={{ fontSize: '18px', marginTop: '10px' }}>{roundResult.description}</p>
            
            {playerStats && (
              <div className="player-stats" style={{ 
                marginTop: '10px', 
                padding: '10px', 
                fontSize: '14px', 
                backgroundColor: 'rgba(255,255,255,0.7)',
                borderRadius: '5px',
                textAlign: 'left'
              }}>
                {roundType === 'offense' ? (
                  <>
                    <p><strong>球員:</strong> {playerStats.player}</p>
                    <p><strong>基礎命中率:</strong> {playerStats.baseHitRate}%</p>
                    {playerStats.skillBonus > 0 && <p><strong>技能加成:</strong> +{playerStats.skillBonus}%</p>}
                    {playerStats.timerBonus > 0 && <p><strong>時機加成:</strong> +{playerStats.timerBonus}%</p>}
                    <p><strong>對手防守影響:</strong> -{playerStats.defenseReduction}%</p>
                    <p><strong>最終命中率:</strong> {playerStats.finalHitRate}%</p>
                    <p><strong>投籃結果:</strong> {playerStats.shot} ({playerStats.shotDescription})</p>
                  </>
                ) : (
                  <>
                    <p><strong>基礎防守率:</strong> {playerStats.baseDefenseRate}%</p>
                    {playerStats.skillBonus > 0 && <p><strong>技能加成:</strong> +{playerStats.skillBonus}%</p>}
                    {playerStats.timerBonus > 0 && <p><strong>時機加成:</strong> +{playerStats.timerBonus}%</p>}
                    <p><strong>對手攻擊影響:</strong> -{playerStats.attackReduction}%</p>
                    <p><strong>最終防守率:</strong> {playerStats.finalDefenseRate}%</p>
                    <p><strong>防守結果:</strong> {playerStats.result} ({playerStats.resultDescription})</p>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
  
  // 顯示類型選擇（僅限第三回合）
  if (type === 'choice' && !roundType) {
    return (
      <div className="game-round basketball-court" style={{ padding: '30px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <h3>第{round}回合 - 請選擇行動</h3>
        <p style={{ marginBottom: '20px' }}>{message}</p>
        <div className="action-buttons" style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '20px' }}>
          <button 
            onClick={() => handleTypeSelect('offense')}
            style={{
              padding: '15px 30px',
              fontSize: '18px',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              transition: 'all 0.3s'
            }}
          >
            進攻
          </button>
          <button 
            onClick={() => handleTypeSelect('defense')}
            style={{
              padding: '15px 30px',
              fontSize: '18px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              transition: 'all 0.3s'
            }}
          >
            防守
          </button>
        </div>
      </div>
    );
  }
  
  // 顯示常規回合選擇界面
  return (
    <div className="game-round" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', backgroundColor: '#f8f9fa', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <h3 style={{ color: roundType === 'offense' ? '#e74c3c' : '#3498db', textAlign: 'center' }}>
        第{round}回合 - {roundType === 'offense' ? '進攻' : '防守'}
      </h3>
      <p style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '20px' }}>{message}</p>
      
      {roundType === 'offense' && (
        <div className="player-selection" style={{ marginBottom: '20px' }}>
          <label htmlFor="player-select" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>選擇球員：</label>
          <select 
            id="player-select" 
            value={selectedPlayerId} 
            onChange={handlePlayerSelect}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              borderRadius: '5px',
              border: '1px solid #ddd',
              backgroundColor: '#fff',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            <option value="">-- 選擇球員 --</option>
            {players.map(player => (
              <option key={player.id} value={player.id}>
                {player.name} (攻擊: {player.attackValue}, 防守: {player.defenseValue})
              </option>
            ))}
          </select>
        </div>
      )}
      
      {availableSkills.length > 0 && (
        <div className="skill-selection" style={{ marginBottom: '20px' }}>
          <label htmlFor="skill-select" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>選擇技能：</label>
          <select 
            id="skill-select" 
            value={selectedSkillId} 
            onChange={handleSkillSelect}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              borderRadius: '5px',
              border: '1px solid #ddd',
              backgroundColor: '#fff',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            <option value="">-- 不使用技能 --</option>
            {availableSkills.map(skill => (
              <option key={skill.id} value={skill.id}>
                {skill.name} ({skill.effectType === 'increase_hit_rate' 
                  ? `命中率 +${skill.effectValue}%` 
                  : skill.effectType === 'increase_defense_rate' 
                  ? `防守成功率 +${skill.effectValue}%` 
                  : `得分 +${skill.effectValue}`})
              </option>
            ))}
          </select>
        </div>
      )}
      
      <button 
        onClick={handleStartAction}
        style={{
          width: '100%',
          padding: '15px 20px',
          fontSize: '16px',
          backgroundColor: roundType === 'offense' ? '#e74c3c' : '#3498db',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '20px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease'
        }}
      >
        {roundType === 'offense' ? '開始進攻' : '開始防守'}
      </button>
    </div>
  );
};

export default GameRound;
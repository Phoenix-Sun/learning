import { useState, useEffect } from 'react';
import TimerBar from './TimerBar';

/**
 * 關鍵時刻組件 - 處理比賽的最後10秒
 * @param {Object} props - 組件屬性
 * @param {Array} props.players - 球員數據數組
 * @param {Array} props.skills - 技能數據數組
 * @param {Array} props.usedSkills - 已使用技能ID數組
 * @param {Object} props.opponent - 對手數據
 * @param {number} props.teamScore - 球隊當前得分
 * @param {number} props.opponentScore - 對手當前得分
 * @param {function} props.onComplete - 完成後的回調函數
 */
const CriticalMoment = ({ 
  players, 
  skills, 
  usedSkills = [], 
  opponent,
  teamScore,
  opponentScore,
  onComplete 
}) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [actionType, setActionType] = useState(''); // 'offense' 或 'defense'
  const [showTimer, setShowTimer] = useState(false);
  const [countdown, setCountdown] = useState(10); // 10秒倒計時
  const [criticalResult, setCriticalResult] = useState(null);
  const [message, setMessage] = useState('比賽進入最後10秒！選擇你的關鍵行動！');
  
  // 計算分差，決定預設行動類型
  useEffect(() => {
    const scoreDiff = teamScore - opponentScore;
    
    if (scoreDiff < 0) {
      // 落後，預設進攻
      setMessage('你落後' + Math.abs(scoreDiff) + '分！選擇你的關鍵行動！');
    } else if (scoreDiff > 0) {
      // 領先，預設防守
      setMessage('你領先' + scoreDiff + '分！選擇你的關鍵行動！');
    } else {
      // 平局
      setMessage('比分持平！選擇你的關鍵行動！');
    }
  }, [teamScore, opponentScore]);
  
  // 處理計時效果
  useEffect(() => {
    if (!actionType) return;
    
    // 關鍵時刻倒計時，更有緊張感
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowTimer(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [actionType]);
  
  // 處理球員選擇
  const handlePlayerSelect = (e) => {
    setSelectedPlayerId(Number(e.target.value));
  };
  
  // 處理技能選擇
  const handleSkillSelect = (e) => {
    setSelectedSkillId(Number(e.target.value));
  };
  
  // 處理行動類型選擇
  const handleActionSelect = (type) => {
    setActionType(type);
  };
  
  // 獲取球員當前可用的技能
  const getAvailableSkills = () => {
    if (!selectedPlayerId) return [];
    
    const player = players.find(p => p.id === selectedPlayerId);
    if (!player) return [];
    
    const skill = skills.find(s => s.id === player.skillId);
    if (!skill || usedSkills.includes(skill.id)) return [];
    
    return [skill];
  };
  
  // 處理計時條完成
  const handleTimerComplete = (success) => {
    // 計算結果，關鍵時刻有更高風險和獎勵
    let points = 0;
    let opponentPoints = 0;
    let description = '';
    
    if (actionType === 'offense') {
      // 基礎命中率，關鍵時刻稍低一些
      let hitRate = 40; 
      
      // 如果選擇了球員，增加基於球員攻擊值的命中率
      if (selectedPlayerId) {
        const player = players.find(p => p.id === selectedPlayerId);
        if (player) {
          hitRate += Math.floor(player.attackValue / 10);
        }
      }
      
      // 如果選擇了技能，應用技能效果
      if (selectedSkillId) {
        const skill = skills.find(s => s.id === selectedSkillId);
        if (skill) {
          if (skill.effectType === 'increase_hit_rate') {
            hitRate += skill.effectValue;
          } else if (skill.effectType === 'add_score' && success) {
            points += skill.effectValue;
          }
        }
      }
      
      // 計時條成功增加命中率
      if (success) {
        hitRate += 30; // 關鍵時刻成功獎勵更高
      }
      
      // 對手防守值降低命中率
      hitRate -= Math.floor(opponent.defenseValue / 10);
      
      // 確保命中率在合理範圍內
      hitRate = Math.max(5, Math.min(hitRate, 95));
      
      // 根據命中率決定是否得分
      const isHit = Math.random() * 100 < hitRate;
      
      if (isHit) {
        // 關鍵時刻得分更高
        points += Math.floor(Math.random() * 2) + 3; // 3-4分
        
        if (Math.random() < 0.3) {
          // 30%機率投進三分球
          points = 3;
          description = `驚人的三分球命中！得到${points}分！`;
        } else {
          description = `關鍵投籃命中！得到${points}分！`;
        }
      } else {
        description = '投籃未命中！對手獲得球權！';
        
        // 對手可能得到反擊機會
        if (Math.random() < 0.4) {
          opponentPoints = Math.floor(Math.random() * 3) + 1;
          description += ` 對手反擊得到${opponentPoints}分！`;
        }
      }
    } else { // 防守回合
      // 基礎防守成功率
      let defenseRate = 45;
      
      // 如果選擇了技能，應用技能效果
      if (selectedSkillId) {
        const skill = skills.find(s => s.id === selectedSkillId);
        if (skill && skill.effectType === 'increase_defense_rate') {
          defenseRate += skill.effectValue;
        }
      }
      
      // 計時條成功增加防守成功率
      if (success) {
        defenseRate += 35; // 關鍵時刻成功獎勵更高
      }
      
      // 對手攻擊值降低防守成功率
      defenseRate -= Math.floor(opponent.attackValue / 10);
      
      // 確保防守成功率在合理範圍內
      defenseRate = Math.max(5, Math.min(defenseRate, 95));
      
      // 根據防守成功率決定是否成功防守
      const isDefenseSuccess = Math.random() * 100 < defenseRate;
      
      if (isDefenseSuccess) {
        description = '精彩的防守！成功阻止對手得分！';
        
        // 可能獲得反擊機會
        if (Math.random() < 0.5) {
          points = Math.floor(Math.random() * 3) + 1;
          description += ` 你迅速反擊得到${points}分！`;
        }
      } else {
        opponentPoints = Math.floor(Math.random() * 3) + 2; // 2-4分
        
        if (Math.random() < 0.25) {
          // 25%機率對手投進三分球
          opponentPoints = 3;
          description = `防守失敗！對手投進三分球得到${opponentPoints}分！`;
        } else {
          description = `防守失敗！對手得到${opponentPoints}分！`;
        }
      }
    }
    
    setCriticalResult({
      points,
      opponentPoints,
      description
    });
    
    // 延遲一下，然後結束關鍵時刻
    setTimeout(() => {
      if (onComplete) {
        onComplete({
          points,
          opponentPoints,
          description,
          usedSkill: selectedSkillId || null
        });
      }
    }, 2500);
  };
  
  const availableSkills = getAvailableSkills();
  
  // 顯示計時條
  if (showTimer) {
    return (
      <div className="critical-moment" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <h3 style={{ color: '#e74c3c' }}>關鍵時刻！最後{countdown}秒</h3>
        
        <TimerBar 
          type={actionType === 'offense' ? 'shooting' : 'defense'} 
          duration={3000} // 更短的時間
          onComplete={handleTimerComplete}
        />
        
        {criticalResult && (
          <div className="result" style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
            <h4>結果</h4>
            <p>{criticalResult.description}</p>
          </div>
        )}
      </div>
    );
  }
  
  // 顯示選擇界面
  return (
    <div className="critical-moment" style={{ 
      padding: '20px', 
      maxWidth: '600px', 
      margin: '0 auto', 
      textAlign: 'center',
      backgroundColor: '#fff8f8',
      borderRadius: '10px',
      boxShadow: '0 0 10px rgba(231, 76, 60, 0.3)'
    }}>
      <h3 style={{ color: '#e74c3c' }}>關鍵時刻！最後10秒</h3>
      <p>{message}</p>
      
      {!actionType ? (
        <div className="action-selection" style={{ marginTop: '20px' }}>
          <button 
            onClick={() => handleActionSelect('offense')}
            style={{
              padding: '10px 20px',
              margin: '0 10px',
              fontSize: '16px',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            進攻
          </button>
          <button 
            onClick={() => handleActionSelect('defense')}
            style={{
              padding: '10px 20px',
              margin: '0 10px',
              fontSize: '16px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            防守
          </button>
        </div>
      ) : (
        <div className="player-selection" style={{ marginTop: '20px' }}>
          {actionType === 'offense' && (
            <>
              <label htmlFor="critical-player-select" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>選擇球員：</label>
              <select 
                id="critical-player-select" 
                value={selectedPlayerId} 
                onChange={handlePlayerSelect}
                style={{
                  width: '100%',
                  padding: '8px',
                  fontSize: '16px',
                  borderRadius: '5px',
                  border: '1px solid #ddd',
                  marginBottom: '15px'
                }}
              >
                <option value="">-- 選擇球員 --</option>
                {players.map(player => (
                  <option key={player.id} value={player.id}>
                    {player.name} (攻擊: {player.attackValue}, 防守: {player.defenseValue})
                  </option>
                ))}
              </select>
            </>
          )}
          
          {availableSkills.length > 0 && (
            <>
              <label htmlFor="critical-skill-select" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>選擇技能：</label>
              <select 
                id="critical-skill-select" 
                value={selectedSkillId} 
                onChange={handleSkillSelect}
                style={{
                  width: '100%',
                  padding: '8px',
                  fontSize: '16px',
                  borderRadius: '5px',
                  border: '1px solid #ddd',
                  marginBottom: '15px'
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
            </>
          )}
          
          <div style={{ marginTop: '20px' }}>
            <h4 style={{ marginBottom: '10px' }}>比賽計時: {countdown}秒</h4>
            <button 
              onClick={() => setShowTimer(true)}
              style={{
                width: '100%',
                padding: '10px 20px',
                fontSize: '16px',
                backgroundColor: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              {actionType === 'offense' ? '投籃！' : '防守！'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CriticalMoment;
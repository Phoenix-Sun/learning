import React from 'react';

/**
 * 遊戲統計組件
 * 顯示進攻或防守的詳細統計數據
 */
const GameStats = ({ playerStats, gameAction }) => {
  if (!playerStats) return null;
  
  return (
    <div className="stats" style={{ 
      marginTop: '20px', 
      padding: '15px', 
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      fontSize: '14px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      border: `1px solid ${gameAction === 'offense' ? '#fadbd8' : '#d4e6f1'}`
    }}>
      <h4 style={{ 
        color: gameAction === 'offense' ? '#e74c3c' : '#3498db',
        marginBottom: '10px',
        borderBottom: '1px solid #eee',
        paddingBottom: '5px'
      }}>
        {gameAction === 'offense' ? '進攻統計數據:' : '防守統計數據:'}
      </h4>
      
      {gameAction === 'offense' ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ 
            backgroundColor: '#ffffff', 
            padding: '8px 12px', 
            borderRadius: '5px', 
            flex: '1 1 45%' 
          }}>
            <p style={{ fontSize: '13px', color: '#7f8c8d', marginBottom: '3px' }}>球員</p>
            <p style={{ fontWeight: 'bold' }}>{playerStats.player}</p>
          </div>
          
          <div style={{ 
            backgroundColor: '#ffffff', 
            padding: '8px 12px', 
            borderRadius: '5px', 
            flex: '1 1 45%' 
          }}>
            <p style={{ fontSize: '13px', color: '#7f8c8d', marginBottom: '3px' }}>基礎命中率</p>
            <p style={{ fontWeight: 'bold' }}>{playerStats.baseHitRate}%</p>
          </div>
          
          {playerStats.skillBonus > 0 && (
            <div style={{ 
              backgroundColor: '#e8f8f5', 
              padding: '8px 12px', 
              borderRadius: '5px', 
              flex: '1 1 45%' 
            }}>
              <p style={{ fontSize: '13px', color: '#27ae60', marginBottom: '3px' }}>技能加成</p>
              <p style={{ fontWeight: 'bold', color: '#27ae60' }}>+{playerStats.skillBonus}%</p>
            </div>
          )}
          
          {playerStats.timerBonus > 0 && (
            <div style={{ 
              backgroundColor: '#fff5e6', 
              padding: '8px 12px', 
              borderRadius: '5px', 
              flex: '1 1 45%' 
            }}>
              <p style={{ fontSize: '13px', color: '#f39c12', marginBottom: '3px' }}>時機加成</p>
              <p style={{ fontWeight: 'bold', color: '#f39c12' }}>+{playerStats.timerBonus}%</p>
            </div>
          )}
          
          <div style={{ 
            backgroundColor: '#ffffff', 
            padding: '8px 12px', 
            borderRadius: '5px', 
            flex: '1 1 45%',
            border: '1px solid #3498db' 
          }}>
            <p style={{ fontSize: '13px', color: '#3498db', marginBottom: '3px' }}>最終命中率</p>
            <p style={{ fontWeight: 'bold', color: '#3498db' }}>{playerStats.finalHitRate}%</p>
          </div>
          
          <div style={{ 
            backgroundColor: playerStats.shot.includes('命中') ? '#d4edda' : '#f8d7da', 
            padding: '8px 12px', 
            borderRadius: '5px', 
            flex: '1 1 45%' 
          }}>
            <p style={{ 
              fontSize: '13px', 
              color: playerStats.shot.includes('命中') ? '#155724' : '#721c24', 
              marginBottom: '3px' 
            }}>
              結果
            </p>
            <p style={{ 
              fontWeight: 'bold',
              color: playerStats.shot.includes('命中') ? '#155724' : '#721c24'
            }}>
              {playerStats.shot}
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ 
            backgroundColor: '#ffffff', 
            padding: '8px 12px', 
            borderRadius: '5px', 
            flex: '1 1 45%' 
          }}>
            <p style={{ fontSize: '13px', color: '#7f8c8d', marginBottom: '3px' }}>基礎防守率</p>
            <p style={{ fontWeight: 'bold' }}>{playerStats.baseDefenseRate}%</p>
          </div>
          
          {playerStats.skillBonus > 0 && (
            <div style={{ 
              backgroundColor: '#e8f8f5', 
              padding: '8px 12px', 
              borderRadius: '5px', 
              flex: '1 1 45%' 
            }}>
              <p style={{ fontSize: '13px', color: '#27ae60', marginBottom: '3px' }}>技能加成</p>
              <p style={{ fontWeight: 'bold', color: '#27ae60' }}>+{playerStats.skillBonus}%</p>
            </div>
          )}
          
          {playerStats.timerBonus > 0 && (
            <div style={{ 
              backgroundColor: '#fff5e6', 
              padding: '8px 12px', 
              borderRadius: '5px', 
              flex: '1 1 45%' 
            }}>
              <p style={{ fontSize: '13px', color: '#f39c12', marginBottom: '3px' }}>時機加成</p>
              <p style={{ fontWeight: 'bold', color: '#f39c12' }}>+{playerStats.timerBonus}%</p>
            </div>
          )}
          
          <div style={{ 
            backgroundColor: '#ffffff', 
            padding: '8px 12px', 
            borderRadius: '5px', 
            flex: '1 1 45%',
            border: '1px solid #3498db' 
          }}>
            <p style={{ fontSize: '13px', color: '#3498db', marginBottom: '3px' }}>最終防守率</p>
            <p style={{ fontWeight: 'bold', color: '#3498db' }}>{playerStats.finalDefenseRate}%</p>
          </div>
          
          <div style={{ 
            backgroundColor: playerStats.result.includes('防守成功') ? '#d4edda' : '#f8d7da', 
            padding: '8px 12px', 
            borderRadius: '5px', 
            flex: '1 1 100%' 
          }}>
            <p style={{ 
              fontSize: '13px', 
              color: playerStats.result.includes('防守成功') ? '#155724' : '#721c24', 
              marginBottom: '3px' 
            }}>
              結果
            </p>
            <p style={{ 
              fontWeight: 'bold',
              color: playerStats.result.includes('防守成功') ? '#155724' : '#721c24'
            }}>
              {playerStats.result}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameStats;
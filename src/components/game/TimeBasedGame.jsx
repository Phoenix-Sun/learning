  // 等待其他球員
  const handleWaitForPlayer = () => {
    // 有機率立即失去機會
    if (gameState === 'critical') {
      // 關鍵時刻等待風險更高
      if (Math.random() < 0.4) {
        toggleGameAction();
        addGameLog('關鍵時刻等待太危險！失去球權！');
        return;
      }
    } else {
      // 普通階段風險較低
      if (Math.random() < 0.2) {
        toggleGameAction();
        addGameLog('等待時間過長，失去球權！');
        return;
      }
    }
    
    // 成功等待紀錄一次
    addGameLog('選擇等待得到更好的球員...');
    
    // 增加等待太久的機率
    if (Math.random() < 0.3) {
      setWaitTooLong(true);
    }
  };  // 球員輪換計時器
  const playerRotationTimerRef = useRef(null);
  const [waitTooLong, setWaitTooLong] = useState(false);
  const [playerRotationTime, setPlayerRotationTime] = useState(8); // 球員輪換剩餘時間
  
  // 球員輪換效果
  useEffect(() => {
    if (gameState === 'playing' || gameState === 'critical') {
      const rotationInterval = gameState === 'critical' ? 4000 : 8000; // 關鍵時刻輪換更快
      
      // 定期更新輪換倒計時
      const rotationCountdownInterval = setInterval(() => {
        if (!showActionBar) { // 只在沒有顯示動作條時更新
          setPlayerRotationTime(prev => {
            if (prev <= 1) {
              return 8; // 重置計時器
            }
            return prev - 1;
          });
        }
      }, 1000);
      
      // 設置球員輪換定時器
      playerRotationTimerRef.current = setInterval(() => {
        if (!showActionBar) { // 只在沒有顯示動作條時輪換
          const shouldSwitchAction = Math.random() < (gameState === 'critical' ? 0.4 : 0.3); // 關鍵時刻有更高機率切換
          
          if (shouldSwitchAction) {
            toggleGameAction();
            // 添加日誌
            if (gameAction === 'offense') {
              addGameLog('對手抓走了球！轉為防守。');
            } else {
              addGameLog('抓到簡定球！轉為進攻。');
            }
          } else {
            // 只輪換球員，不改變進攻/防守狀態
            selectRandomPlayer(players, gameAction);
            addGameLog(`球傳給 ${currentPlayer?.name}。`);
          }
          
          setPlayerRotationTime(8); // 重置輪換計時器
          setWaitTooLong(false);
        }
      }, rotationInterval);
      
      // 設置等待太久的檢查
      const waitTooLongTimeout = setTimeout(() => {
        if (!showActionBar && gameState === 'playing') {
          setWaitTooLong(true);
          addGameLog('你等待的時間太久了！');
        }
      }, 15000); // 15秒後讓球員知道等待太久
      
      return () => {
        clearInterval(playerRotationTimerRef.current);
        clearInterval(rotationCountdownInterval);
        clearTimeout(waitTooLongTimeout);
      };
    }
  }, [gameState, showActionBar, gameAction, players]);
  // 幾秒後自動切換球員
  const playerSwitchInterval = 5000; // 5秒
  // 最多等待時間，超過就失去機會
  const maxWaitTime = 15000; // 15秒
  // 被對手抄球機率型逐漸增加
  const stealChanceIncreaseRate = 0.01; // 每秒增加的1%
  
  // 記錄等待時間
  const [waitTime, setWaitTime] = useState(0);
  // 監控是否被對手抄到球
  const [stealChance, setStealChance] = useState(0.0);
  // 狀態自動切換定時器
  const playerSwitchTimerRef = useRef(null);
  const waitTimeTimerRef = useRef(null);import { useState, useEffect, useRef } from 'react';
import TimerBar from './TimerBar';
import BlockingBar from './BlockingBar';
import GameHeader from './game-modules/GameHeader';
import GameResult from './game-modules/GameResult';
import GameStats from './game-modules/GameStats';
import GameLog from './game-modules/GameLog';
import {
  loadPlayers,
  loadSkills,
  loadOpponents,
  calculateTeamAttack,
  calculateTeamDefense,
  simulateFirstThreeQuarters
} from '../../utils/dataLoader';
import { calculateOffenseResult, calculateDefenseResult } from '../../utils/gameCalculations';

/**
 * 基於時間的籃球比賽組件
 * 模擬第四節最後2分鐘的比賽
 */
const TimeBasedGame = () => {
  // 遊戲數據與狀態
  const [players, setPlayers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [opponents, setOpponents] = useState([]);
  const [opponent, setOpponent] = useState(null);
  const [gameState, setGameState] = useState('loading'); // loading, ready, playing, critical, ended
  const [usedSkills, setUsedSkills] = useState([]);
  const [gameAction, setGameAction] = useState(null); // offense, defense
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [showActionBar, setShowActionBar] = useState(false);
  const [actionResult, setActionResult] = useState(null);
  const [playerStats, setPlayerStats] = useState(null);
  const [message, setMessage] = useState('');
  const [gameTime, setGameTime] = useState(120); // 2分鐘倒計時
  const gameTimerRef = useRef(null);
  const [teamScore, setTeamScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [gameLog, setGameLog] = useState([]);
  
  // 加載遊戲數據
  useEffect(() => {
    const loadGameData = async () => {
      try {
        const loadedPlayers = await loadPlayers();
        const loadedSkills = await loadSkills();
        const loadedOpponents = await loadOpponents();
        
        setPlayers(loadedPlayers);
        setSkills(loadedSkills);
        setOpponents(loadedOpponents);
        
        // 隨機選擇對手
        const randomOpponent = loadedOpponents[Math.floor(Math.random() * loadedOpponents.length)];
        setOpponent(randomOpponent);
        
        // 模擬前三節比賽
        const teamAttack = calculateTeamAttack(loadedPlayers);
        const teamDefense = calculateTeamDefense(loadedPlayers);
        
        const result = simulateFirstThreeQuarters(
          teamAttack, 
          teamDefense, 
          randomOpponent.attackValue, 
          randomOpponent.defenseValue
        );
        
        setTeamScore(result.teamScore);
        setOpponentScore(result.opponentScore);
        
        // 設置初始遊戲動作和球員
        setGameAction(Math.random() > 0.5 ? 'offense' : 'defense');
        selectRandomPlayer(loadedPlayers, Math.random() > 0.5 ? 'offense' : 'defense');
        
        // 更新遊戲狀態
        setGameState('ready');
      } catch (error) {
        console.error('加載遊戲數據錯誤:', error);
        setMessage('加載遊戲數據時出錯，請重試');
      }
    };
    
    loadGameData();
  }, []);

  // 根據需要選擇一個適合當前動作的隨機球員
  const selectRandomPlayer = (playersList, action) => {
    if (!playersList || playersList.length === 0) {
      console.error('無效的球員列表');
      return;
    }
    
    try {
      const filteredPlayers = playersList.filter(player => {
        if (action === 'offense') {
          return player.attackValue >= 75; // 進攻需要較高的攻擊值
        } else {
          return player.defenseValue >= 75; // 防守需要較高的防守值
        }
      });

      if (filteredPlayers.length === 0) {
        // 如果沒有符合條件的球員，就從所有球員中隨機選擇
        const randomPlayer = playersList[Math.floor(Math.random() * playersList.length)];
        setCurrentPlayer(randomPlayer);
        console.log(`選擇了隨機球員: ${randomPlayer.name}`);
      } else {
        // 從符合條件的球員中隨機選擇
        const randomPlayer = filteredPlayers[Math.floor(Math.random() * filteredPlayers.length)];
        setCurrentPlayer(randomPlayer);
        console.log(`選擇了適合${action === 'offense' ? '進攻' : '防守'}的球員: ${randomPlayer.name}`);
      }
    } catch (error) {
      console.error('選擇球員出錯:', error);
      // 出錯時從原列表中隨機選擇一名球員
      if (playersList.length > 0) {
        const fallbackPlayer = playersList[0];
        setCurrentPlayer(fallbackPlayer);
        console.log(`失敗後選擇了球員: ${fallbackPlayer.name}`);
      }
    }
  };
  
  // 遊戲計時器
  useEffect(() => {
    if (gameState === 'playing' || gameState === 'critical') {
      gameTimerRef.current = setInterval(() => {
        setGameTime(prevTime => {
          const newTime = prevTime - 1;
          
          // 切換到關鍵時刻
          if (newTime === 30 && gameState !== 'critical') {
            setGameState('critical');
            addGameLog('進入最後30秒關鍵時刻！');
          }
          
          // 時間結束
          if (newTime <= 0) {
            clearInterval(gameTimerRef.current);
            setGameState('ended');
            endGame();
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
      
      return () => {
        if (gameTimerRef.current) {
          clearInterval(gameTimerRef.current);
        }
      };
    }
  }, [gameState]);
  
  // 添加遊戲日誌
  const addGameLog = (message) => {
    setGameLog(prev => [...prev, { time: gameTime, message }]);
  };
  
  // 開始進攻/防守
  const handleStartAction = () => {
    setShowActionBar(true);
  };
  
  // 計時條/蓋火鍋條完成回調
  const handleActionComplete = (success) => {
    setTimeout(() => {
      try {
        // 根據當前動作計算結果
        if (gameAction === 'offense') {
          handleOffenseResult(success);
        } else {
          handleDefenseResult(success);
        }
        
        // 切換到下一個動作並顯示結果
        setTimeout(() => {
          setShowActionBar(false);
          setActionResult(null);
          setPlayerStats(null);
          toggleGameAction();
        }, 2000);
      } catch (error) {
        console.error('處理遊戲動作結果出錯:', error);
        // 出錯時還原介面
        setShowActionBar(false);
        toggleGameAction();
      }
    }, 1000);
  };
  
  // 處理進攻結果
  const handleOffenseResult = (timerSuccess) => {
    if (!currentPlayer) return;
    
    // 獲取當前球員的技能
    const playerSkill = skills.find(s => s.id === currentPlayer.skillId);
    const usedSkill = !usedSkills.includes(currentPlayer.skillId) && Math.random() > 0.5;
    
    // 計算進攻結果
    const result = calculateOffenseResult(
      currentPlayer,
      usedSkill ? playerSkill : null,
      timerSuccess,
      gameState === 'critical'
    );
    
    if (result.usedSkill && usedSkill) {
      setUsedSkills(prev => [...prev, currentPlayer.skillId]);
    }
    
    // 更新得分和遊戲日誌
    if (result.points > 0) {
      setTeamScore(prev => prev + result.points);
      addGameLog(result.description);
    } else {
      addGameLog(result.description);
    }
    
    setActionResult({
      points: result.points,
      opponentPoints: 0,
      description: result.description
    });
    
    setPlayerStats(result.stats);
  };
  
  // 處理防守結果
  const handleDefenseResult = (blockingSuccess) => {
    if (!currentPlayer) {
      console.error('無效的球員數據');
      return;
    }
    
    if (!opponent) {
      console.error('無效的對手數據');
      return;
    }
    
    try {
      // 獲取當前球員的技能
      const playerSkill = skills.find(s => s.id === currentPlayer.skillId);
      const usedSkill = playerSkill && !usedSkills.includes(currentPlayer.skillId) && Math.random() > 0.5;
      
      // 計算防守結果
      const result = calculateDefenseResult(
        currentPlayer,
        usedSkill ? playerSkill : null,
        blockingSuccess,
        opponent,
        gameState === 'critical'
      );
      
      if (result.usedSkill && usedSkill && playerSkill) {
        setUsedSkills(prev => [...prev, currentPlayer.skillId]);
      }
      
      // 更新得分和遊戲日誌
      if (result.opponentPoints > 0) {
        setOpponentScore(prev => prev + result.opponentPoints);
        addGameLog(result.description);
      } else {
        addGameLog(result.description);
      }
      
      setActionResult({
        points: 0,
        opponentPoints: result.opponentPoints,
        description: result.description
      });
      
      setPlayerStats(result.stats);
    } catch (error) {
      console.error('處理防守結果出錯:', error);
      // 發生錯誤時仍然添加一個預設的遊戲日誌
      addGameLog(`${currentPlayer.name} 嘗試防守，但無法判斷結果。`);
    }
  };
  
  // 切換遊戲動作（進攻/防守）
  const toggleGameAction = () => {
    try {
      const newAction = gameAction === 'offense' ? 'defense' : 'offense';
      setGameAction(newAction);
      
      // 確保有球員列表才進行選擇
      if (players && players.length > 0) {
        selectRandomPlayer(players, newAction);
      } else {
        console.error('無法選擇球員，球員列表為空');
      }
    } catch (error) {
      console.error('切換遊戲動作出錯:', error);
      // 確保仍然設置了遊戲動作
      if (!gameAction) {
        setGameAction('offense');
      }
    }
  };
  
  // 開始遊戲
  const startGame = () => {
    setGameState('playing');
  };
  
  // 結束遊戲
  const endGame = () => {
    setGameState('ended');
    // 可以在這裡添加結束遊戲後的統計和獎勵計算
  };
  
  // 重新開始遊戲
  const restartGame = () => {
    // 重置所有遊戲狀態
    setGameState('loading');
    setUsedSkills([]);
    setCurrentPlayer(null);
    setShowActionBar(false);
    setActionResult(null);
    setPlayerStats(null);
    setMessage('');
    setGameTime(120);
    setGameLog([]);
    
    // 重新加載遊戲數據
    const loadGameData = async () => {
      try {
        const randomOpponent = opponents[Math.floor(Math.random() * opponents.length)];
        setOpponent(randomOpponent);
        
        // 模擬前三節比賽
        const teamAttack = calculateTeamAttack(players);
        const teamDefense = calculateTeamDefense(players);
        
        const result = simulateFirstThreeQuarters(
          teamAttack, 
          teamDefense, 
          randomOpponent.attackValue, 
          randomOpponent.defenseValue
        );
        
        setTeamScore(result.teamScore);
        setOpponentScore(result.opponentScore);
        
        // 設置初始遊戲動作和球員
        const initialAction = Math.random() > 0.5 ? 'offense' : 'defense';
        setGameAction(initialAction);
        selectRandomPlayer(players, initialAction);
        
        // 更新遊戲狀態
        setGameState('ready');
      } catch (error) {
        console.error('重新加載遊戲數據錯誤:', error);
        setMessage('重新加載遊戲數據時出錯，請重試');
      }
    };
    
    loadGameData();
  };
  
  // 取得當前球員可能使用的技能
  const getCurrentPlayerSkill = () => {
    if (!currentPlayer) return null;
    const skill = skills.find(s => s.id === currentPlayer.skillId);
    if (!skill || usedSkills.includes(skill.id)) return null;
    return skill;
  };
  
  const currentSkill = getCurrentPlayerSkill();
  
  // 渲染遊戲主畫面 - 進攻/防守條
  if (showActionBar) {
    return (
      <div className="game-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <GameHeader 
          gameState={gameState} 
          gameTime={gameTime} 
          gameAction={gameAction} 
          opponent={opponent}
          teamScore={teamScore}
          opponentScore={opponentScore}
        />
        
        {gameAction === 'offense' ? (
          <TimerBar 
            type="shooting" 
            onComplete={handleActionComplete}
            duration={gameState === 'critical' ? 3000 : 5000}
          />
        ) : (
          // 防守模式時確保 BlockingBar 還存在
          <BlockingBar 
            onComplete={handleActionComplete}
            duration={gameState === 'critical' ? 3000 : 5000}
          />
        )}
        
        {actionResult && <GameResult actionResult={actionResult} />}
        {playerStats && <GameStats playerStats={playerStats} gameAction={gameAction} />}
      </div>
    );
  }
  
  // 選擇球員和技能介面
  if (gameState === 'playing' || gameState === 'critical') {
    return (
      <div className="game-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <GameHeader 
          gameState={gameState} 
          gameTime={gameTime} 
          gameAction={gameAction} 
          opponent={opponent}
          teamScore={teamScore}
          opponentScore={opponentScore}
        />
        
        <div className="current-player" style={{ 
          padding: '20px', 
          backgroundColor: '#fff',
          borderRadius: '10px',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: `2px solid ${gameAction === 'offense' ? '#e74c3c' : '#3498db'}`,
          position: 'relative'
        }}>
          {/* 球員輪換計時器 */}
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            backgroundColor: playerRotationTime <= 3 ? '#e74c3c' : '#f39c12',
            color: 'white',
            borderRadius: '50%',
            width: '25px',
            height: '25px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '14px',
            animation: playerRotationTime <= 3 ? 'pulse 1s infinite' : 'none'
          }}>
            {playerRotationTime}
          </div>
          
          <h3 style={{ textAlign: 'center', marginBottom: '15px' }}>當前{gameAction === 'offense' ? '進攻' : '防守'}球員</h3>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            backgroundColor: gameAction === 'offense' ? 'rgba(231, 76, 60, 0.1)' : 'rgba(52, 152, 219, 0.1)',
            padding: '15px',
            borderRadius: '8px'
          }}>
            <div>
              <h4>{currentPlayer?.name}</h4>
              <div style={{ display: 'flex', gap: '20px', marginTop: '5px' }}>
                <div>
                  <span style={{ color: '#7f8c8d', fontSize: '14px' }}>攻擊值: </span>
                  <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>{currentPlayer?.attackValue}</span>
                </div>
                <div>
                  <span style={{ color: '#7f8c8d', fontSize: '14px' }}>防守值: </span>
                  <span style={{ color: '#3498db', fontWeight: 'bold' }}>{currentPlayer?.defenseValue}</span>
                </div>
              </div>
            </div>
            
            {currentSkill && (
              <div style={{ 
                backgroundColor: '#fff', 
                padding: '10px 15px', 
                borderRadius: '5px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <span style={{ color: '#8e44ad', fontSize: '14px' }}>可用技能: </span>
                <span style={{ color: '#8e44ad', fontWeight: 'bold' }}>{currentSkill.name}</span>
              </div>
            )}
          </div>
          
          {/* 等待太久警告 */}
          {waitTooLong && (
            <div style={{
              backgroundColor: '#f8d7da',
              color: '#721c24',
              padding: '10px',
              borderRadius: '5px',
              marginTop: '10px',
              textAlign: 'center',
              animation: 'pulse 1s infinite'
            }}>
              警告: 你等待的時間太久了！有可能失去機會！
            </div>
          )}
          
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '20px',
            gap: '10px'
          }}>
            <button 
              onClick={handleStartAction}
              style={{
                flex: '1',
                padding: '12px 15px',
                fontSize: '16px',
                backgroundColor: gameAction === 'offense' ? '#e74c3c' : '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              {gameAction === 'offense' ? '投籃' : '防守'}
            </button>
            
            <button 
              onClick={handleWaitForPlayer}
              style={{
                flex: '1',
                padding: '12px 15px',
                fontSize: '16px',
                backgroundColor: '#95a5a6',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              等待其他球員
            </button>
          </div>
        </div>
        
        <GameLog gameLog={gameLog} />
      </div>
    );
  }
  
  // 遊戲結束畫面
  if (gameState === 'ended') {
    const isWin = teamScore > opponentScore;
    const isDraw = teamScore === opponentScore;
    
    return (
      <div className="game-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
        <h2 style={{ 
          color: isWin ? '#27ae60' : isDraw ? '#f39c12' : '#e74c3c',
          marginBottom: '20px'
        }}>
          比賽結束
        </h2>
        
        <div style={{ 
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <h3>最終比分</h3>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
            <div>
              <p>我隊</p>
              <h2>{teamScore}</h2>
            </div>
            <div>
              <h2>-</h2>
            </div>
            <div>
              <p>{opponent?.name}</p>
              <h2>{opponentScore}</h2>
            </div>
          </div>
          
          <h3 style={{ 
            marginTop: '20px',
            color: isWin ? '#27ae60' : isDraw ? '#f39c12' : '#e74c3c'
          }}>
            {isWin ? '恭喜獲勝！' : isDraw ? '平局！' : '失敗！再接再厲！'}
          </h3>
        </div>
        
        <GameLog gameLog={gameLog} />
        
        <button 
          onClick={restartGame}
          style={{
            padding: '12px 30px',
            fontSize: '16px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          重新開始
        </button>
      </div>
    );
  }
  
  // 準備開始畫面
  if (gameState === 'ready') {
    return (
      <div className="game-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '20px' }}>準備開始第四節比賽</h2>
        
        <div style={{ 
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <h3>當前比分</h3>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
            <div>
              <p>我隊</p>
              <h2>{teamScore}</h2>
            </div>
            <div>
              <h2>-</h2>
            </div>
            <div>
              <p>{opponent?.name}</p>
              <h2>{opponentScore}</h2>
            </div>
          </div>
        </div>
        
        <p>準備進入第四節最後2分鐘！把握時機，贏得比賽！</p>
        
        <button 
          onClick={startGame}
          style={{
            padding: '12px 30px',
            fontSize: '16px',
            backgroundColor: '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          開始比賽
        </button>
      </div>
    );
  }
  
  // 加載畫面
  return (
    <div className="game-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
      <h2>正在加載比賽...</h2>
      {message && <p style={{ color: '#e74c3c' }}>{message}</p>}
    </div>
  );
};

export default TimeBasedGame;
import React, { useEffect } from 'react';

/**
 * 遊戲計時器組件
 * 控制遊戲時間倒計時
 */
const GameTimer = ({ 
  gameTime, 
  setGameTime, 
  gameState, 
  isPaused, 
  onCriticalMoment, 
  onGameEnd 
}) => {
  useEffect(() => {
    if ((gameState === 'playing' || gameState === 'critical') && !isPaused) {
      const timer = setInterval(() => {
        setGameTime(prevTime => {
          const newTime = prevTime - 1;
          
          // 切換到關鍵時刻
          if (newTime === 30 && gameState !== 'critical' && onCriticalMoment) {
            onCriticalMoment();
          }
          
          // 時間結束
          if (newTime <= 0) {
            clearInterval(timer);
            if (onGameEnd) onGameEnd();
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [gameState, isPaused, setGameTime, onCriticalMoment, onGameEnd]);
  
  return null; // 這是一個無界面的功能組件，只負責邏輯處理
};

export default GameTimer;
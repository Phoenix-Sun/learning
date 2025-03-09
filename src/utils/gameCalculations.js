/**
 * 籃球比賽計算邏輯模組
 * 包含進攻、防守等計算功能
 */

/**
 * 計算進攻結果
 * @param {Object} player - 進攻球員
 * @param {Object} skill - 使用的技能
 * @param {Boolean} timerSuccess - 計時條成功與否
 * @param {Boolean} isCritical - 是否處於關鍵時刻
 * @returns {Object} 計算結果
 */
export const calculateOffenseResult = (player, skill, timerSuccess, isCritical) => {
  if (!player) return { points: 0, description: '無效球員', stats: null };
  
  // 計算基礎命中率 (0-100)
  let baseHitRate = 40 + (player.attackValue - 60) * 0.5;
  
  // 技能加成
  let skillBonus = 0;
  let usedSkill = false;
  
  if (skill && skill.effectType === 'increase_hit_rate') {
    skillBonus = skill.effectValue;
    usedSkill = true;
  }
  
  // 時機操作加成 (0-30)
  const timerBonus = timerSuccess ? 30 : 0;
  
  // 關鍵時刻加成
  if (isCritical) {
    // 關鍵時刻提高隨機性
    baseHitRate = baseHitRate * (0.9 + Math.random() * 0.2);
  }
  
  // 最終命中率
  const finalHitRate = Math.min(baseHitRate + skillBonus + timerBonus, 100);
  
  // 模擬投籃結果
  const roll = Math.random() * 100;
  const isHit = roll <= finalHitRate;
  
  // 計算得分
  let points = 0;
  let shotType = '';
  
  if (isHit) {
    // 普通投籃 (2分) 或三分球 (3分)
    const isThreePointer = Math.random() < 0.3 || skill?.name === '三分神射';
    points = isThreePointer ? 3 : 2;
    shotType = isThreePointer ? `${points}分球命中！` : `${points}分球命中！`;
    
    // 特殊技能：灌籃高手
    if (skill && skill.effectType === 'add_score') {
      points += 1; // 灌籃額外加1分
      shotType = '華麗灌籃！得分 +' + points + '分！';
      usedSkill = true;
    }
  } else {
    shotType = '投籃不中';
  }
  
  // 返回結果
  return {
    points,
    usedSkill,
    description: points > 0 ? `${player.name} ${shotType}` : `${player.name} 投籃不中`,
    stats: {
      player: player.name,
      baseHitRate: baseHitRate.toFixed(1),
      skillBonus,
      timerBonus,
      finalHitRate: finalHitRate.toFixed(1),
      shot: points > 0 ? `命中 ${points} 分` : '未命中'
    }
  };
};

/**
 * 計算防守結果
 * @param {Object} player - 防守球員
 * @param {Object} skill - 使用的技能
 * @param {Boolean} blockingSuccess - 蓋火鍋成功與否
 * @param {Object} opponent - 對手隊伍
 * @param {Boolean} isCritical - 是否處於關鍵時刻
 * @returns {Object} 計算結果
 */
export const calculateDefenseResult = (player, skill, blockingSuccess, opponent, isCritical) => {
  if (!player || !opponent) return { opponentPoints: 0, description: '無效數據', stats: null };
  
  // 計算基礎防守率 (0-100)
  let baseDefenseRate = 30 + (player.defenseValue - 60) * 0.5;
  
  // 技能加成
  let skillBonus = 0;
  let usedSkill = false;
  
  if (skill && skill.effectType === 'increase_defense_rate') {
    skillBonus = skill.effectValue;
    usedSkill = true;
  }
  
  // 蓋火鍋操作加成 (0-40)
  const blockingBonus = blockingSuccess ? 40 : 0;
  
  // 關鍵時刻加成
  if (isCritical) {
    // 關鍵時刻提高隨機性
    baseDefenseRate = baseDefenseRate * (0.9 + Math.random() * 0.2);
  }
  
  // 最終防守率
  const finalDefenseRate = Math.min(baseDefenseRate + skillBonus + blockingBonus, 100);
  
  // 模擬對手進攻
  const opponentOffenseValue = opponent.attackValue;
  const opponentHitChance = 40 + (opponentOffenseValue - 60) * 0.3; // 對手基礎命中率
  
  // 最終對手命中率 = 對手基礎命中率 - 我方防守率 (有下限保證)
  const finalOpponentHitRate = Math.max(opponentHitChance - finalDefenseRate * 0.6, 10);
  
  // 模擬對手投籃結果
  const roll = Math.random() * 100;
  const isOpponentHit = roll <= finalOpponentHitRate;
  
  // 計算對手得分
  let opponentPoints = 0;
  let resultDesc = '';
  
  if (isOpponentHit) {
    // 對手普通投籃 (2分) 或三分球 (3分)
    const isThreePointer = Math.random() < 0.3;
    opponentPoints = isThreePointer ? 3 : 2;
    
    // 根據蓋火鍋動作決定結果描述
    if (blockingSuccess) {
      resultDesc = `${player.name} 幾乎封蓋成功，但${opponent.name}隊 ${isThreePointer ? '三分球' : '投籃'}還是進了！`;
    } else {
      resultDesc = `${opponent.name}隊 ${isThreePointer ? '三分球' : '投籃'}得分！`;
    }
    
    // 特殊技能：盜球高手
    if (skill && skill.effectType === 'steal_ball') {
      // 盜球成功的話可以阻止得分
      if (Math.random() < 0.7) {
        opponentPoints = 0;
        resultDesc = `${player.name} 精彩盜球，阻止了對手得分！`;
        usedSkill = true;
      }
    }
  } else {
    // 根據蓋火鍋動作決定結果描述
    if (blockingSuccess) {
      resultDesc = `${player.name} 完美封蓋，${opponent.name}隊投籃不中！`;
    } else {
      resultDesc = `${player.name} 防守成功，${opponent.name}隊投籃不中！`;
    }
  }
  
  // 返回結果
  return {
    opponentPoints,
    usedSkill,
    description: resultDesc,
    stats: {
      baseDefenseRate: baseDefenseRate.toFixed(1),
      skillBonus,
      timerBonus: blockingBonus,
      finalDefenseRate: finalDefenseRate.toFixed(1),
      result: opponentPoints > 0 ? `對手得分 ${opponentPoints} 分` : '防守成功'
    }
  };
};
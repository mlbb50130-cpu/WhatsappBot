const spamData = new Map();

class AntiSpamManager {
  static recordMessage(userId, groupId) {
    const key = `${userId}-${groupId}`;
    
    if (!spamData.has(key)) {
      spamData.set(key, {
        messages: 1,
        firstMessageTime: Date.now()
      });
      return { isSpam: false, count: 1 };
    }

    const data = spamData.get(key);
    const timeElapsed = Date.now() - data.firstMessageTime;

    // Reset if outside spam window
    if (timeElapsed > 10000) {
      spamData.set(key, {
        messages: 1,
        firstMessageTime: Date.now()
      });
      return { isSpam: false, count: 1 };
    }

    data.messages++;

    return {
      isSpam: data.messages > 5,
      count: data.messages
    };
  }

  static isSpamming(userId, groupId) {
    const key = `${userId}-${groupId}`;
    const data = spamData.get(key);

    if (!data) return false;

    const timeElapsed = Date.now() - data.firstMessageTime;
    if (timeElapsed > 10000) {
      spamData.delete(key);
      return false;
    }

    return data.messages > 5;
  }

  static clear(userId, groupId) {
    const key = `${userId}-${groupId}`;
    spamData.delete(key);
  }

  static clearAll() {
    spamData.clear();
  }
}

// Cleanup old spam records every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of spamData.entries()) {
    if (now - data.firstMessageTime > 60000) {
      spamData.delete(key);
    }
  }
}, 60000);

module.exports = AntiSpamManager;

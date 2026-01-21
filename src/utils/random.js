class RandomUtils {
  static range(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static choice(array) {
    if (!Array.isArray(array) || array.length === 0) return null;
    return array[Math.floor(Math.random() * array.length)];
  }

  static shuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  static chance(percentage) {
    return Math.random() * 100 < percentage;
  }

  static weighted(items) {
    // items: [{ value: 'item1', weight: 50 }, { value: 'item2', weight: 30 }]
    let totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;

    for (const item of items) {
      random -= item.weight;
      if (random <= 0) return item.value;
    }

    return items[items.length - 1].value;
  }

  static generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = RandomUtils;

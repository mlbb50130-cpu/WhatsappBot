/**
 * 🧪 Unit Tests - Admin Actions Manager
 * À exécuter avec: npm test ou node tests/admin-actions.test.js
 */

const AdminActionsManager = require('../src/utils/adminActions');

// Mock Baileys Socket
class MockSocket {
  constructor() {
    this.messages = [];
    this.updates = [];
    this.user = {
      id: '1234567890:123456@s.whatsapp.net'
    };
  }

  async sendMessage(jid, message) {
    this.messages.push({ jid, message });
    return { key: { id: Date.now() } };
  }

  async groupMetadata(jid) {
    if (jid === 'valid_group@g.us') {
      return {
        id: 'valid_group@g.us',
        subject: 'Test Group',
        desc: 'A test group',
        participants: [
          {
            id: '1234567890@s.whatsapp.net', // Bot
            admin: 'admin'
          },
          {
            id: '9876543210@s.whatsapp.net', // Regular user
            admin: null
          },
          {
            id: '1111111111@s.whatsapp.net', // Admin user
            admin: 'admin'
          }
        ],
        owner: '1111111111@s.whatsapp.net',
        announce: false,
        restrict: false,
        creation: Math.floor(Date.now() / 1000)
      };
    }
    throw new Error('Invalid group');
  }

  async groupParticipantsUpdate(jid, participants, action) {
    if (action === 'remove' || action === 'promote' || action === 'demote') {
      this.updates.push({ jid, participants, action });
      return;
    }
    throw new Error('Invalid action');
  }

  async groupUpdateSubject(jid, subject) {
    this.updates.push({ jid, subject, action: 'updateSubject' });
  }

  async groupUpdateDescription(jid, description) {
    this.updates.push({ jid, description, action: 'updateDescription' });
  }

  async groupSettingUpdate(jid, setting) {
    this.updates.push({ jid, setting, action: 'updateSetting' });
  }
}

// Test Suite
class TestSuite {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  async test(name, testFn) {
    try {
      await testFn();
      this.passed++;
      console.log(`✅ ${name}`);
    } catch (error) {
      this.failed++;
      console.log(`❌ ${name}`);
      console.log(`   Error: ${error.message}`);
    }
  }

  async runAll() {
    const sock = new MockSocket();
    const groupJid = 'valid_group@g.us';
    const botJid = '1234567890@s.whatsapp.net';
    const regularUserJid = '9876543210@s.whatsapp.net';
    const adminUserJid = '1111111111@s.whatsapp.net';

    console.log('\n🧪 Admin Actions Manager Test Suite\n');
    console.log('═════════════════════════════════════\n');

    // Test 1: Check if bot is admin
    await this.test('isBotAdmin - Bot should be recognized as admin', async () => {
      const result = await AdminActionsManager.isBotAdmin(sock, groupJid);
      if (!result) throw new Error('Bot should be admin');
    });

    // Test 2: Check if bot is not admin (invalid group)
    await this.test('isBotAdmin - Should fail for invalid group', async () => {
      try {
        await AdminActionsManager.isBotAdmin(sock, 'invalid@g.us');
        throw new Error('Should have thrown error');
      } catch (e) {
        if (e.message === 'Should have thrown error') throw e;
        // Expected error
      }
    });

    // Test 3: Check if user is admin
    await this.test('isUserAdmin - Recognize admin user', async () => {
      const result = await AdminActionsManager.isUserAdmin(sock, groupJid, adminUserJid);
      if (!result.success || !result.isAdmin) {
        throw new Error('User should be recognized as admin');
      }
    });

    // Test 4: Check if user is not admin
    await this.test('isUserAdmin - Recognize non-admin user', async () => {
      const result = await AdminActionsManager.isUserAdmin(sock, groupJid, regularUserJid);
      if (!result.success || result.isAdmin) {
        throw new Error('User should not be admin');
      }
    });

    // Test 5: Kick user
    await this.test('kickUser - Successfully remove user', async () => {
      const result = await AdminActionsManager.kickUser(sock, groupJid, regularUserJid, 'Test kick');
      if (!result.success) {
        throw new Error(result.error);
      }
      if (sock.updates.length === 0 || sock.updates[sock.updates.length - 1].action !== 'remove') {
        throw new Error('Kick update not recorded');
      }
    });

    // Test 6: Cannot kick bot
    await this.test('kickUser - Cannot kick bot itself', async () => {
      const result = await AdminActionsManager.kickUser(sock, groupJid, botJid, 'Try to kick bot');
      if (result.success) {
        throw new Error('Should not allow kicking bot');
      }
      if (result.code !== 'CANNOT_KICK_SELF') {
        throw new Error('Wrong error code');
      }
    });

    // Test 7: Promote user
    await this.test('promoteUser - Successfully promote user', async () => {
      const result = await AdminActionsManager.promoteUser(sock, groupJid, regularUserJid);
      if (!result.success) {
        throw new Error(result.error);
      }
    });

    // Test 8: Demote user
    await this.test('demoteUser - Successfully demote admin', async () => {
      const result = await AdminActionsManager.demoteUser(sock, groupJid, adminUserJid);
      if (!result.success) {
        throw new Error(result.error);
      }
    });

    // Test 9: Mute group
    await this.test('muteGroup - Successfully mute', async () => {
      const result = await AdminActionsManager.muteGroup(sock, groupJid);
      if (!result.success) {
        throw new Error(result.error);
      }
    });

    // Test 10: Unmute group
    await this.test('unmuteGroup - Successfully unmute', async () => {
      const result = await AdminActionsManager.unmuteGroup(sock, groupJid);
      if (!result.success) {
        throw new Error(result.error);
      }
    });

    // Test 11: Lock group
    await this.test('lockGroup - Successfully lock', async () => {
      const result = await AdminActionsManager.lockGroup(sock, groupJid);
      if (!result.success) {
        throw new Error(result.error);
      }
    });

    // Test 12: Unlock group
    await this.test('unlockGroup - Successfully unlock', async () => {
      const result = await AdminActionsManager.unlockGroup(sock, groupJid);
      if (!result.success) {
        throw new Error(result.error);
      }
    });

    // Test 13: Change subject
    await this.test('changeGroupSubject - Successfully change name', async () => {
      const result = await AdminActionsManager.changeGroupSubject(sock, groupJid, 'New Name');
      if (!result.success) {
        throw new Error(result.error);
      }
    });

    // Test 14: Subject too long
    await this.test('changeGroupSubject - Reject subject over 25 chars', async () => {
      const result = await AdminActionsManager.changeGroupSubject(
        sock,
        groupJid,
        'This is a very long group name that exceeds the limit'
      );
      if (result.success) {
        throw new Error('Should reject long subject');
      }
      if (result.code !== 'SUBJECT_TOO_LONG') {
        throw new Error('Wrong error code');
      }
    });

    // Test 15: Get group info
    await this.test('getGroupInfo - Successfully retrieve info', async () => {
      const result = await AdminActionsManager.getGroupInfo(sock, groupJid);
      if (!result.success || !result.data.subject) {
        throw new Error('Should retrieve group info');
      }
    });

    // Test 16: Get group admins
    await this.test('getGroupAdmins - Successfully list admins', async () => {
      const result = await AdminActionsManager.getGroupAdmins(sock, groupJid);
      if (!result.success || result.admins.length === 0) {
        throw new Error('Should list admins');
      }
    });

    // Test 17: Send notification
    await this.test('sendGroupNotification - Successfully send message', async () => {
      const result = await AdminActionsManager.sendGroupNotification(sock, groupJid, '📢 Test notification');
      if (!result.success) {
        throw new Error(result.error);
      }
    });

    // Summary
    console.log('\n═════════════════════════════════════');
    console.log(`\n✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    console.log(`📊 Total: ${this.passed + this.failed}\n`);

    if (this.failed === 0) {
      console.log('🎉 All tests passed!\n');
    } else {
      console.log(`⚠️ ${this.failed} test(s) failed\n`);
    }

    return this.failed === 0;
  }
}

// Run tests if executed directly
if (require.main === module) {
  const suite = new TestSuite();
  suite.runAll().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Test suite error:', error);
    process.exit(1);
  });
}

module.exports = TestSuite;

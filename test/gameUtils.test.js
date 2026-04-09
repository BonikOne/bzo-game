const { shuffle, createCodenamesSetup, assignTeams } = require('../gameUtils');

describe('gameUtils', () => {
  describe('shuffle', () => {
    it('should shuffle an array', () => {
      const array = [1, 2, 3, 4, 5];
      const shuffled = shuffle(array.slice());
      expect(shuffled).toHaveLength(5);
      expect(shuffled).toEqual(expect.arrayContaining([1, 2, 3, 4, 5]));
      // Note: This test might occasionally fail due to randomness, but it's rare
    });
  });

  describe('createCodenamesSetup', () => {
    it('should create a valid codenames setup', () => {
      const setup = createCodenamesSetup();
      expect(setup.words).toHaveLength(25);
      expect(setup.keyMap).toHaveLength(25);
      expect(['red', 'blue']).toContain(setup.startingTeam);
      expect(new Set(setup.keyMap)).toEqual(new Set(['red', 'blue', 'neutral', 'assassin']));
    });
  });

  describe('assignTeams', () => {
    it('should assign teams to players', () => {
      const players = [
        { id: '1', nickname: 'Player1' },
        { id: '2', nickname: 'Player2' },
        { id: '3', nickname: 'Player3' },
        { id: '4', nickname: 'Player4' }
      ];
      const teams = assignTeams(players);
      expect(teams.red).toHaveLength(2);
      expect(teams.blue).toHaveLength(2);
      expect(teams.red.concat(teams.blue)).toEqual(expect.arrayContaining(players));
    });
  });
});
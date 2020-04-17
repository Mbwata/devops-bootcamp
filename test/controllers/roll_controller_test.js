require('../setup_test.js');

describe('roll', async () => {
  beforeEach(async () => {
    await deleteData();
  });

  // Test 1:
  //   Validate that it rolls a default number of sides and replies correctly
  it('should return the expected "A die with n sides..." result', async () => {
    await request(app).get('/roll')
        .expect((res) => {
          res.status.should.equal(200);
          res.text.should.match(/^A die with 6 sides just rolled a \d\./);
        });
  });

  // Test 2:
  //   Validate that it rolls a specified number of sides and replies correctly
  it('should return the expected "A die with specified-n sides..." result', async () => {
    for (let i = 0; i < 100; i++) {
      await request(app).get('/roll?sides=13')
          .expect((res) => {
            res.status.should.equal(200);
            res.text.should.match(/^A die with 13 sides just rolled a \d{1,2}\./);
            // console.log(res.text);
          });
    }
  });

  // Test 3:
  //   Validate that it saves to the database when a die is rolled
  it('should save the roll result on each roll', async () => {
    const rollResult = await request(app).get('/roll?sides=13')
        .expect(async (res) => {
          res.status.should.equal(200);
          res.text.should.match(/A die with 13 sides just rolled a/);
        });

    // query database for result & perform assertions
    let rollHistories = await db.any('SELECT * FROM roll_history;');
    // console.log(rollHistories);
    rollHistories.length.should.equal(1);

    // assert result
    const resultMessage = rollResult.res.text;
    let rollMatch = resultMessage.match(/A die with 13 sides just rolled a (\d+)/);
    // console.log(rollMatch[1]);
    rollHistories[0].result.toString().should.equal(rollMatch[1]);
  });

});

describe('test data management', async () => {
  beforeEach(async () => {
    await deleteData();
  });

  // Test 3b:
  //   Validate that test data management is working properly
  it('should ensure the start of each test has a clean database', async () => {
    let rollHistories = await db.any('SELECT * FROM roll_history;');
    // console.log(rollHistories);
    rollHistories.length.should.equal(0);
  });

  context('with seeded data', async() => {
    let rollHistory;

    beforeEach(async () => {
      rollHistory = await seedRollHistory();
    });

    // Test 3c:
    //   Validate that seed data is populated into the database before each test
    it('should have some seeded data in the roll_history table', async () => {
      let rollHistories = await db.any('SELECT * FROM roll_history;');
      // console.log(rollHistories);
      rollHistories.length.should.equal(1);
      rollHistories[0].die_sides.should.equal(rollHistory.die_sides);
      rollHistories[0].result.should.equal(rollHistory.result);
      rollHistories[0].roll_time.getTime().should.equal(rollHistory.roll_time.getTime());
    })
  });
});

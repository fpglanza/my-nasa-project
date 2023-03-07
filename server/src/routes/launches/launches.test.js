const request = require('supertest');
const app = require('../../app');
const { loadPlanetsData } = require('../../models/planets.model');
const { 
  mongoConnect,
  mongoDisconnect
 } = require('../../services/mongo');
 const {
  loadPlanetsData
 } = require('../../models/planets.model')


describe('Launches API', () => {
  beforeAll( async () => {
    await mongoConnect();
    await loadPlanetsData();
  });

  afterAll( async () => {
    await mongoDisconnect();
  });

  describe('TEST GET /v1/launches', () => {
    test('it should respond with 200 success', async () => {
      const response = await request(app)
        .get('/v1/launches')
        .expect('Content-Type', /json/)
        .expect(200);
    });
  });
  
  describe('TEST POST /v1/launches', () => {
    const completeLaunchData = {
        mission: 'Uss Something',
        rocket: 'Tomareomo 69',
        target: 'Kepler-442 b',
        launchDate: 'January 4, 2028',
      };
  
    const launchDataWithoutDate = {
      mission: 'Uss Something',
      rocket: 'Tomareomo 69',
      target: 'Kepler-442 b',
    } 
  
    const launchDataWithInvalidDate = {
      mission: 'Uss Something',
      rocket: 'Tomareomo 69',
      target: 'Kepler-442 b',
      launchDate: 'hehe',
    }
    
  
    test('it should respond with 201 success, and post a launch', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(completeLaunchData)
        .expect('Content-Type', /json/)
        .expect(201);
  
      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();
      expect(responseDate).toBe(requestDate);
  
      expect(response.body).toMatchObject(launchDataWithoutDate);
    });
  
    test('it should catch missing required proprieties', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(launchDataWithoutDate)
        .expect('Content-Type', /json/)
        .expect(400);
  
      expect(response.body).toStrictEqual({
        error: 'Missing required property',
      });
    });
  
    test('it should catch invalid dates', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(launchDataWithInvalidDate)
        .expect('Content-Type', /json/)
        .expect(400);
  
      expect(response.body).toStrictEqual({
        error: 'Invalid launch date',
      });
    });
  });
})


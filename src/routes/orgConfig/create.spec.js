/**
 * Tests for create.js
 */
import _ from 'lodash';
import chai from 'chai';
import request from 'supertest';

import server from '../../app';
import testUtil from '../../tests/util';
import models from '../../models';

const should = chai.should();

describe('CREATE organization config', () => {
  beforeEach(() => testUtil.clearDb()
    .then(() => models.OrgConfig.create({
      orgId: 'ORG1',
      configName: 'project_catefory_url',
      configValue: 'http://localhost/url',
      createdBy: 1,
      updatedBy: 1,
    })).then(() => Promise.resolve()),
  );
  after(testUtil.clearDb);

  describe('POST /orgConfig', () => {
    const body = {
      param: {
        orgId: 'ORG2',
        configName: 'project_catefory_url',
        configValue: 'http://localhost/url',
      },
    };

    it('should return 403 if user is not authenticated', (done) => {
      request(server)
        .post('/v4/projects/metadata/orgConfig')
        .send(body)
        .expect(403, done);
    });

    it('should return 403 for member', (done) => {
      request(server)
        .post('/v4/projects/metadata/orgConfig')
        .set({
          Authorization: `Bearer ${testUtil.jwts.member}`,
        })
        .send(body)
        .expect(403, done);
    });

    it('should return 403 for copilot', (done) => {
      request(server)
        .post('/v4/projects/metadata/orgConfig')
        .set({
          Authorization: `Bearer ${testUtil.jwts.copilot}`,
        })
        .send(body)
        .expect(403, done);
    });

    it('should return 403 for manager', (done) => {
      request(server)
        .post('/v4/projects/metadata/orgConfig')
        .set({
          Authorization: `Bearer ${testUtil.jwts.manager}`,
        })
        .send(body)
        .expect(403, done);
    });

    it('should return 422 for missing orgId', (done) => {
      const invalidBody = _.cloneDeep(body);
      delete invalidBody.param.orgId;

      request(server)
        .post('/v4/projects/metadata/orgConfig')
        .set({
          Authorization: `Bearer ${testUtil.jwts.admin}`,
        })
        .send(invalidBody)
        .expect('Content-Type', /json/)
        .expect(422, done);
    });

    it('should return 422 for missing configName', (done) => {
      const invalidBody = _.cloneDeep(body);
      delete invalidBody.param.configName;

      request(server)
        .post('/v4/projects/metadata/orgConfig')
        .set({
          Authorization: `Bearer ${testUtil.jwts.admin}`,
        })
        .send(invalidBody)
        .expect('Content-Type', /json/)
        .expect(422, done);
    });

    it('should return 422 for duplicated orgId and configName', (done) => {
      const invalidBody = _.cloneDeep(body);
      invalidBody.param.orgId = 'ORG1';
      invalidBody.param.configName = 'project_catefory_url';

      request(server)
        .post('/v4/projects/metadata/orgConfig')
        .set({
          Authorization: `Bearer ${testUtil.jwts.admin}`,
        })
        .send(invalidBody)
        .expect('Content-Type', /json/)
        .expect(422, done);
    });

    it('should return 201 for admin', (done) => {
      request(server)
        .post('/v4/projects/metadata/orgConfig')
        .set({
          Authorization: `Bearer ${testUtil.jwts.admin}`,
        })
        .send(body)
        .expect('Content-Type', /json/)
        .expect(201)
        .end((err, res) => {
          const resJson = res.body.result.content;
          resJson.orgId.should.be.eql(body.param.orgId);
          resJson.configName.should.be.eql(body.param.configName);
          resJson.configValue.should.be.eql(body.param.configValue);

          resJson.createdBy.should.be.eql(40051333); // admin
          should.exist(resJson.createdAt);
          resJson.updatedBy.should.be.eql(40051333); // admin
          should.exist(resJson.updatedAt);
          should.not.exist(resJson.deletedBy);
          should.not.exist(resJson.deletedAt);

          done();
        });
    });

    it('should return 201 for connect admin', (done) => {
      request(server)
        .post('/v4/projects/metadata/orgConfig')
        .set({
          Authorization: `Bearer ${testUtil.jwts.connectAdmin}`,
        })
        .send(body)
        .expect('Content-Type', /json/)
        .expect(201)
        .end((err, res) => {
          const resJson = res.body.result.content;
          resJson.orgId.should.be.eql(body.param.orgId);
          resJson.configName.should.be.eql(body.param.configName);
          resJson.configValue.should.be.eql(body.param.configValue);
          resJson.createdBy.should.be.eql(40051336); // connect admin
          resJson.updatedBy.should.be.eql(40051336); // connect admin
          done();
        });
    });
  });
});

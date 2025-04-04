const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    let testThreadId;
    let testReplyId;
    const testBoard = 'test-board';
    const testPassword = 'testpassword';
    const wrongPassword = 'wrongpassword';
    
    suite('API ROUTING FOR /api/threads/{board}', function() {
        
        test('Creating a new thread: POST request to /api/threads/{board}', function(done) {
            chai.request(server)
                .post(`/api/threads/${testBoard}`)
                .send({
                    text: 'Test Thread',
                    delete_password: testPassword
                })
                .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.isObject(res.body);
                    assert.property(res.body, '_id');
                    assert.property(res.body, 'text');
                    assert.property(res.body, 'created_on');
                    assert.property(res.body, 'bumped_on');
                    assert.property(res.body, 'replies');
                    assert.equal(res.body.text, 'Test Thread');
                    testThreadId = res.body._id;
                    done();
                });
        });
        
        test('Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}', function(done) {
            chai.request(server)
                .get(`/api/threads/${testBoard}`)
                .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    if (res.body.length > 0) {
                        assert.property(res.body[0], '_id');
                        assert.property(res.body[0], 'text');
                        assert.property(res.body[0], 'created_on');
                        assert.property(res.body[0], 'bumped_on');
                        assert.property(res.body[0], 'replies');
                        assert.isArray(res.body[0].replies);
                        assert.isAtMost(res.body[0].replies.length, 3);
                    }
                    assert.isAtMost(res.body.length, 10);
                    done();
                });
        });
        
        test('Reporting a thread: PUT request to /api/threads/{board}', function(done) {
            chai.request(server)
                .put(`/api/threads/${testBoard}`)
                .send({
                    thread_id: testThreadId
                })
                .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.text, 'reported');
                    done();
                });
        });
        
        test('Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password', function(done) {
            chai.request(server)
                .delete(`/api/threads/${testBoard}`)
                .send({
                    thread_id: testThreadId,
                    delete_password: wrongPassword
                })
                .end(function(err, res) {
                    assert.equal(res.status, 403);
                    assert.equal(res.text, 'incorrect password');
                    done();
                });
        });
    });
    
    suite('API ROUTING FOR /api/replies/{board}', function() {
        
        // Create a new thread for reply tests
        let replyTestThreadId;
        
        before(function(done) {
            chai.request(server)
                .post(`/api/threads/${testBoard}`)
                .send({
                    text: 'Thread for Reply Tests',
                    delete_password: testPassword
                })
                .end(function(err, res) {
                    replyTestThreadId = res.body._id;
                    done();
                });
        });
        
        test('Creating a new reply: POST request to /api/replies/{board}', function(done) {
            chai.request(server)
                .post(`/api/replies/${testBoard}`)
                .send({
                    thread_id: replyTestThreadId,
                    text: 'Test Reply',
                    delete_password: testPassword
                })
                .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.isObject(res.body);
                    assert.property(res.body, '_id');
                    assert.property(res.body, 'text');
                    assert.property(res.body, 'created_on');
                    assert.equal(res.body.text, 'Test Reply');
                    testReplyId = res.body._id;
                    done();
                });
        });
        
        test('Viewing a single thread with all replies: GET request to /api/replies/{board}', function(done) {
            chai.request(server)
                .get(`/api/replies/${testBoard}`)
                .query({ thread_id: replyTestThreadId })
                .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.isObject(res.body);
                    assert.property(res.body, '_id');
                    assert.property(res.body, 'text');
                    assert.property(res.body, 'created_on');
                    assert.property(res.body, 'bumped_on');
                    assert.property(res.body, 'replies');
                    assert.isArray(res.body.replies);
                    assert.isAtLeast(res.body.replies.length, 1);
                    done();
                });
        });
        
        test('Reporting a reply: PUT request to /api/replies/{board}', function(done) {
            chai.request(server)
                .put(`/api/replies/${testBoard}`)
                .send({
                    thread_id: replyTestThreadId,
                    reply_id: testReplyId
                })
                .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.text, 'reported');
                    done();
                });
        });
        
        test('Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password', function(done) {
            chai.request(server)
                .delete(`/api/replies/${testBoard}`)
                .send({
                    thread_id: replyTestThreadId,
                    reply_id: testReplyId,
                    delete_password: wrongPassword
                })
                .end(function(err, res) {
                    assert.equal(res.status, 403);
                    assert.equal(res.text, 'incorrect password');
                    done();
                });
        });
        
        test('Deleting a reply with the correct password: DELETE request to /api/replies/{board} with a valid delete_password', function(done) {
            chai.request(server)
                .delete(`/api/replies/${testBoard}`)
                .send({
                    thread_id: replyTestThreadId,
                    reply_id: testReplyId,
                    delete_password: testPassword
                })
                .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.text, 'success');
                    done();
                });
        });
        
        // Test for deleting the original thread (must be at the end)
        test('Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password', function(done) {
            chai.request(server)
                .delete(`/api/threads/${testBoard}`)
                .send({
                    thread_id: testThreadId,
                    delete_password: testPassword
                })
                .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.text, 'success');
                    done();
                });
        });
    });
});

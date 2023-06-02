import chai from "chai";
import sinon from "sinon";
import userService from "../../app/services/user.service";
import userRepository from "../../app/repositories/user.repository";
import { DuplicateItemError } from "../../app/errors/duplicate.item.error";
import { NotFoundError } from "../../app/errors/not.found.error";
import { BadRequestError } from "../../app/errors/bad.request.error";
import { UserTypes } from "../../app/constants/enums/user.types";
import { User } from "../../app/entities/user.entity";

const expect = chai.expect;

describe("User Service", () => {
    describe("createUser", () => {
        afterEach(() => {
            sinon.restore();
        });

        it("should create a new user", async () => {
            const requestBody = {
                name: "John Doe",
                email: "johndoe@example.com",
                password: "password",
                type: UserTypes.USER,
            };

            const getUserByEmailStub = sinon.stub(userRepository, "getUserByEmail").resolves(null);
            const createUserStub = sinon.stub(userRepository, "createUser").resolves({ id: 1 } as User);

            const userId = await userService.createUser(requestBody);

            expect(userId).to.equal(1);
            expect(getUserByEmailStub.calledOnce).to.be.true
            expect(createUserStub.calledOnce).to.be.true;
        });

        it("should throw DuplicateItemError if user with the same email already exists", async () => {
            const requestBody = {
                name: "John Doe",
                email: "johndoe@example.com",
                password: "password",
                type: UserTypes.USER,
            };

            const getUserByEmailStub = sinon.stub(userRepository, "getUserByEmail").resolves({ id: 1 } as User);
            const createUserStub = sinon.stub(userRepository, "createUser")
                .throws(new DuplicateItemError('user already exists with email: johndoe@example.com'));

            try {
                await userService.createUser(requestBody);
                chai.assert.fail("Expected DuplicateItemError to be thrown");
            } catch (error) {
                expect(error).to.be.instanceOf(DuplicateItemError);
                expect(error.message).to.equal(
                    `user already exists with email: ${requestBody.email}`
                );
            }
            expect(getUserByEmailStub.calledOnce).to.be.true;
            expect(createUserStub.calledOnce).to.be.false;
        });

    });

    describe("login", () => {
        afterEach(() => {
            sinon.restore();
        });

        it("should login the user with valid credentials", async () => {
            const email = "johndoe@example.com";
            const password = "password";
            const currentUser = {
                id: 1,
                userName: "John Doe",
                email,
                password,
                type: UserTypes.USER,
            };

            const getUserByEmailStub = sinon.stub(userRepository, "getUserByEmail").resolves(currentUser as User);

            const result = await userService.login(email, password);

            expect(result).to.deep.equal(currentUser);
            expect(getUserByEmailStub.calledOnce).to.be.true;
        });

        it("should throw NotFoundError if user with the provided email does not exist", async () => {
            const email = "johndoe@example.com";
            const password = "password";

            const getUserByEmailStub = sinon.stub(userRepository, "getUserByEmail").resolves(null);

            try {
                await userService.login(email, password);
                chai.assert.fail("Expected NotFoundError to be thrown");
            } catch (error) {
                expect(error).to.be.instanceOf(NotFoundError);
                expect(error.message).to.equal(`No user found with email: ${email}`);
            }
            expect(getUserByEmailStub.calledOnce).to.be.true;
        });

        it("should throw BadRequestError if user provides invalid password", async () => {
            const email = "johndoe@example.com";
            const password = "wrongpassword";
            const currentUser = {
                id: 1,
                userName: "John Doe",
                email,
                password: "password",
                type: UserTypes.USER,
            };

            const getUserByEmailStub = sinon.stub(userRepository, "getUserByEmail").resolves(currentUser as User);

            try {
                await userService.login(email, password);
                chai.assert.fail("Expected BadRequestError to be thrown");
            } catch (error) {
                expect(error).to.be.instanceOf(BadRequestError);
                expect(error.message).to.equal(`Invalid password: ${password}`);
            }
            expect(getUserByEmailStub.calledOnce).to.be.true;
        });

    });

    describe("adminLogin", () => {
        afterEach(() => {
            sinon.restore();
        });

        it("should login the admin user with valid credentials", async () => {
            const email = "admin@example.com";
            const password = "password";
            const currentUser = {
                id: 1,
                userName: "Admin",
                email,
                password,
                type: UserTypes.ADMIN_USER,
            };

            const getUserByEmailStub = sinon.stub(userRepository, "getUserByEmail").resolves(currentUser as User);

            const result = await userService.adminLogin(email, password);

            expect(result).to.deep.equal(currentUser);
            expect(getUserByEmailStub.calledOnce).to.be.true;
        });

        it("should throw NotFoundError if admin user with the provided email does not exist", async () => {
            const email = "admin@example.com";
            const password = "password";

            const getUserByEmailStub = sinon.stub(userRepository, "getUserByEmail").resolves(null);

            try {
                await userService.adminLogin(email, password);
                chai.assert.fail("Expected NotFoundError to be thrown");
            } catch (error) {
                expect(error).to.be.instanceOf(NotFoundError);
                expect(error.message).to.equal(`No user found with email: ${email}`);
            }
            expect(getUserByEmailStub.calledOnce).to.be.true;
        });

        it("should throw BadRequestError if admin user provides invalid password", async () => {
            const email = "admin@example.com";
            const password = "wrongpassword";
            const currentUser = {
                id: 1,
                userName: "Admin",
                email,
                password: "password",
                type: UserTypes.ADMIN_USER,
            };

            const getUserByEmailStub = sinon.stub(userRepository, "getUserByEmail").resolves(currentUser as User);

            try {
                await userService.adminLogin(email, password);
                chai.assert.fail("Expected BadRequestError to be thrown");
            } catch (error) {
                expect(error).to.be.instanceOf(BadRequestError);
                expect(error.message).to.equal(`Invalid password: ${password}`);
            }
            expect(getUserByEmailStub.calledOnce).to.be.true;
        });

        it("should throw BadRequestError if user is not an admin", async () => {
            const email = "johndoe@example.com";
            const password = "password";
            const currentUser = {
                id: 1,
                userName: "John Doe",
                email,
                password,
                type: UserTypes.USER,
            };

            const getUserByEmailStub = sinon.stub(userRepository, "getUserByEmail").resolves(currentUser as User);

            try {
                await userService.adminLogin(email, password);
                chai.assert.fail("Expected BadRequestError to be thrown");
            } catch (error) {
                expect(error).to.be.instanceOf(BadRequestError);
                expect(error.message).to.equal(`user: ${email} is not admin`);
            }
            expect(getUserByEmailStub.calledOnce).to.be.true;
        });

    });

    describe("getUserById", () => {
        afterEach(() => {
            sinon.restore();
        });

        it("should return the user with the provided userId", async () => {
            const userId = 1;
            const user = {
                id: userId,
                userName: "John Doe",
                email: "johndoe@example.com",
                password: "password",
                type: UserTypes.USER,
            };

            const getUserByIdStub = sinon.stub(userRepository, "getUserById").resolves(user);

            const result = await userService.getUserById(userId);

            expect(result).to.deep.equal(user);
            expect(getUserByIdStub.calledOnce).to.be.true;
        });

        it("should return null if no user found with the provided userId", async () => {
            const userId = 1;

            const getUserByIdStub = sinon.stub(userRepository, "getUserById").resolves(null);

            const result = await userService.getUserById(userId);

            expect(result).to.be.null;
            expect(getUserByIdStub.calledOnce).to.be.true;
        });

    });
});

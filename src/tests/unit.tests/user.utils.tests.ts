import { expect } from 'chai';
import { UserTypes } from '../../app/constants/enums/user.types';
import { User } from '../../app/entities/user.entity';
import { UserModel } from '../../app/models/user.model';
import userUtils from '../../app/utils/user.utils';

describe('User Utils', () => {
    describe('mapUserModel', () => {
        it('should map the user model to a new user entity', async () => {
            const newUser: User = new User();
            const userModel = {} as UserModel;
            userModel.name = 'John Doe';
            userModel.email = 'john@example.com';
            userModel.password = 'password123';
            userModel.type = UserTypes.USER;

            await userUtils.mapUserModelToEntity(newUser, userModel);

            expect(newUser.id).to.be.a('number');
            expect(newUser.userName).to.equal('John Doe');
            expect(newUser.email).to.equal('john@example.com');
            expect(newUser.password).to.equal('password123');
            expect(newUser.type).to.equal(UserTypes.USER);
            expect(newUser.loans).to.be.an('array');
        });
    });

    describe('mapRequestBodyToUserModel', () => {
        it('should map the request body to a new user model', async () => {
            const reqBody = {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
                type: UserTypes.ADMIN_USER,
            };

            const userModel = {} as UserModel;

            await userUtils.mapRequestBodyToUserModel(reqBody, userModel);

            expect(userModel.name).to.equal('John Doe');
            expect(userModel.email).to.equal('john@example.com');
            expect(userModel.password).to.equal('password123');
            expect(userModel.type).to.equal(UserTypes.ADMIN_USER);
        });
    });
});

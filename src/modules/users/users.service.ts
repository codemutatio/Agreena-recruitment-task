import { DeepPartial, FindOptionsWhere, Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import config from "config/config";
import dataSource from "orm/orm.config";
import { UnprocessableEntityError } from "errors/errors";
import { GoogleMapAPI } from "providers/googleMaps.provider";
import { CreateUserDto } from "./dto/create-user.dto";
import { User } from "./entities/user.entity";
import { UpdateUserLocationDataDto } from "./dto/update-userLocationData.dto";

export class UsersService {
  private readonly usersRepository: Repository<User>;
  private readonly googleMapAPI: GoogleMapAPI;

  constructor() {
    this.usersRepository = dataSource.getRepository(User);
    this.googleMapAPI = new GoogleMapAPI({ apiKey: config.GOOGLE_MAPS_API_KEY });
  }

  public async createUser(data: CreateUserDto): Promise<User> {
    const { email, password } = data;

    const existingUser = await this.findOneBy({ email: email });
    if (existingUser) throw new UnprocessableEntityError("A user for the email already exists");

    const hashedPassword = await this.hashPassword(password);

    const userData: DeepPartial<User> = { email, hashedPassword };

    const newUser = this.usersRepository.create(userData);
    return this.usersRepository.save(newUser);
  }

  public async updateUserLocation(userId: string, data: UpdateUserLocationDataDto): Promise<User> {
    const { address } = data;

    const coordinate = await this.googleMapAPI.getCoordinateFromAddressString({ addressInput: address });

    if (!coordinate) throw new UnprocessableEntityError("Invalid address");

    return this.usersRepository.save({ id: userId, address, coordinates: coordinate });
  }

  public async findOneBy(param: FindOptionsWhere<User>): Promise<User | null> {
    return this.usersRepository.findOneBy({ ...param });
  }

  private async hashPassword(password: string, salt_rounds = config.SALT_ROUNDS): Promise<string> {
    const salt = await bcrypt.genSalt(salt_rounds);
    return bcrypt.hash(password, salt);
  }
}

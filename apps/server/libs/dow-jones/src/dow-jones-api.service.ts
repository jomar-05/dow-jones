import {
  ForbiddenException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { AxiosInstance, AxiosPromise, AxiosRequestConfig } from 'axios';
import createDefaultAxios from 'libs/http/createDefaultAxios';
import { isEmpty } from 'lodash';
import dowJonesConfig from '../../../config/dowJonesConfig';
import { AuthNResponseDto, AuthZResponseDto } from '../dto/auth.dto';
import { DowJonesError } from '../errors/dowJonesError';
import { AUTH_ROUTES } from '../routes';

@Injectable()
export class DowJonesApiService {
  private readonly httpAuth: AxiosInstance;

  private readonly httpApi: AxiosInstance;

  private accessToken: string | undefined;

  constructor(
    @Inject(dowJonesConfig.KEY)
    private readonly config: ConfigType<typeof dowJonesConfig>,
  ) {
    this.httpAuth = createDefaultAxios(this.config.authUrl);

    this.httpApi = createDefaultAxios(this.config.searchUrl);
  }

  private async getAuthN(): Promise<AuthNResponseDto> {
    let authN;
    try {
      const requestBody = {
        client_id: this.config.clientId,
        username: this.config.userName,
        password: this.config.password,
        connection: this.config.connection,
        grant_type: this.config.authnGranType,
        scope: this.config.authnScope,
      };
      authN = await this.httpAuth.post(AUTH_ROUTES.TOKEN, requestBody);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      switch (error?.response?.data?.error) {
        case DowJonesError.AUTHN_INVALID_CLIENT_ERROR:
          throw new ForbiddenException(
            'You are not authorized to access this resource.',
          );

        case DowJonesError.AUTHN_INVALID_USER_ERROR:
          throw new UnauthorizedException(
            'The username or password you entered is incorrect.',
          );

        case DowJonesError.AUTHN_LOGIN_FAIL_CONNECTION_ERROR:
          throw new UnauthorizedException(
            'Failed to connect during login. Please check your network connection.',
          );

        default:
          throw error;
      }
    }
    return authN?.data as AuthNResponseDto;
  }

  private async getAuthZ(): Promise<AuthZResponseDto> {
    const authN = await this.getAuthN();
    let authZ;

    try {
      const requestBody = {
        assertion: authN?.id_token,
        client_id: this.config.clientId,
        grant_type: this.config.authzGrantType,
        scope: this.config.authZScope,
      };

      authZ = await this.httpAuth.post(AUTH_ROUTES.TOKEN, requestBody);

      this.accessToken = authZ?.data?.access_token;
    } catch (error: any) {
      switch (error?.response?.data?.error) {
        case DowJonesError.AUTHZ_ERROR:
          throw new UnauthorizedException(
            'You do not have permission to access this resource.',
          );

        case DowJonesError.AUTHZ_SCOPE_ERROR:
          throw new UnauthorizedException(
            'Your request is missing the required scope.',
          );

        default:
          throw error;
      }
    }

    return authZ?.data as AuthZResponseDto;
  }

  private async ensureAuthZ(): Promise<AuthZResponseDto> {
    if (!this.accessToken) {
      const authZ = await this.getAuthZ();
      this.accessToken = authZ.access_token;
    }

    return {
      access_token: this.accessToken,
    } as AuthZResponseDto;
  }

  public async sendRequest(request: AxiosRequestConfig): AxiosPromise {
    const authZ = await this.ensureAuthZ();

    const headers = {
      ...request.headers,
      Authorization: `Bearer ${authZ.access_token}`,
    };

    const { data = undefined, params = {} } = request;

    try {
      const resp = await this.httpApi({
        ...request,
        headers,
        data: !isEmpty(data) ? { ...data } : undefined,
        params: isEmpty(data) ? { ...params } : {},
      });

      return resp?.data?.data;
    } catch (error: any) {
      switch (error?.response?.status) {
        case HttpStatus.NOT_FOUND:
          throw new NotFoundException('The requested URL was not found.');

        case HttpStatus.INTERNAL_SERVER_ERROR:
          throw new InternalServerErrorException(
            'An internal server error occurred. Please try again later.',
          );

        case HttpStatus.UNAUTHORIZED:
          if (this.accessToken) {
            this.accessToken = '';
          }
          break;
        default:
          throw error;
      }
    }
    return this.sendRequest(request);
  }
}

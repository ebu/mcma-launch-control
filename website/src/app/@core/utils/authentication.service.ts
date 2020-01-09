import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";
import { CognitoIdentityCredentials } from "aws-sdk";
import { Observable, from } from "rxjs";
import { ConfigService } from "./config.service";
import { switchMap, zip } from "rxjs/operators";
import { AuthenticationDetails, CognitoUser, CognitoUserPool, CognitoUserSession, ICognitoUserPoolData } from "amazon-cognito-identity-js";

@Injectable()
export class AuthenticationService {
    private credentialsSubject: BehaviorSubject<CognitoIdentityCredentials>;
    public credentials$: Observable<CognitoIdentityCredentials>;

    constructor(private configService: ConfigService) {
        this.credentialsSubject = new BehaviorSubject<CognitoIdentityCredentials>(null);
        this.credentials$ = this.credentialsSubject.asObservable();
    }

    get currentCredentialsValue(): CognitoIdentityCredentials {
        return this.credentialsSubject.value;
    }

    login(username: string, password: string): Observable<CognitoIdentityCredentials> {
        return this.configService.get<ICognitoUserPoolData>("aws.cognito.userPool").pipe(
            switchMap(cognitoConfig => this.authenticateWithCognito(cognitoConfig, username, password)),
        );
    }

    private authenticateWithCognito(cognitoConfig: ICognitoUserPoolData, username: string, password: string): Observable<CognitoIdentityCredentials> {
        const cognitoUser = new CognitoUser({
            Username: username,
            Pool: new CognitoUserPool(cognitoConfig),
        });

        cognitoUser.authenticateUser(
            new AuthenticationDetails({ Username: username, Password: password }),
            {
                onSuccess: (session: CognitoUserSession) => this.onAuthSuccess(cognitoConfig, session),
                onFailure: (err) => this.onAuthFailure(err),
            });

        return this.credentials$;
    }

    private onAuthSuccess(cognitoConfig: ICognitoUserPoolData, session: CognitoUserSession) {
        console.log("auth success");

        this.configService.get<string>("aws.cognito.identityPool.id").pipe(
            zip(this.configService.get<string>("aws.region")),
            switchMap(([identityPoolId, region]) => {
                console.log("identity pool id = " + identityPoolId + ", region = " + region);
                const creds = new CognitoIdentityCredentials({
                    IdentityPoolId: identityPoolId,
                    Logins: {
                        [`cognito-idp.${region}.amazonaws.com/${cognitoConfig.UserPoolId}`]: session.getIdToken().getJwtToken(),
                    },
                }, { region });

                return from(creds.getPromise().then(() => creds));
            }),
        ).subscribe(this.credentialsSubject);
    }

    private onAuthFailure(err) {
        console.log("failed to get aws credentials: ", err);
        this.credentialsSubject.next(null);
    }


    logout() {
        this.credentialsSubject.next(null);
    }
}

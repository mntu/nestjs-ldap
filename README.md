# NestJS OpenLDAP

<p align="center">
    <a href="https://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
    <a href="https://www.openldap.org" target="blank"><img src="https://www.openldap.org/images/headers/LDAPworm.gif" width="320" alt="Openldap Logo" /></a>
</p>

## Description

A NestJS library for OpenLDAP refer [nestjs-ldap](https://github.com/wisekaa03/nestjs-ldap)

## Installation

```bash
$ yarn add @mntu/nestjs-ldap
```

## Usage

- Simple:

```typescript
  import { ldapADattributes, LdapModule, Scope } from '@mntu/nestjs-ldap';

  @Module({
    imports: [
      ...
      LdapModule.registerAsync({
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => (
          {
            logger: new Logger(AppModule.name),
            domains: [
              LdapModule.createDomainConfig({
                  name: 'example.com',
                  url: 'ldaps://localhost:636',
                  bindDN: 'CN=admin,DC=example,DC=local',
                  bindCredentials: 'admin',
                  baseDN: 'DC=example,DC=local',
                  tlsOptions: { rejectUnauthorized: false },
              }),
            ]
          }),
      }),
      ...
    ]
  })
  export class AppModule {}
```

- Simple with Redis cache:

```typescript
  import { ldapADattributes, LdapModule, Scope } from '@mntu/nestjs-ldap';

  @Module({
    imports: [
      ...
      LdapModule.registerAsync({
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => (
          {
            logger: new Logger(AppModule.name),
            cache: new Redis(), /* optional */
            cacheUrl: 'redis://username:password@redis-example.com:6379/0', /* optional */
            cacheTtl: 600, /* optional */
            domains: [
              LdapModule.createDomainConfig({
                  name: 'example.com',
                  url: 'ldaps://localhost:636',
                  bindDN: 'CN=admin,DC=example,DC=local',
                  bindCredentials: 'admin',
                  baseDN: 'DC=example,DC=local',
                  tlsOptions: { rejectUnauthorized: false },
              }),
            ]
          }),
      }),
      ...
    ]
  })
  export class AppModule {}
```

- Advance:

```typescript
  import { ldapADattributes, LdapModule, Scope } from '@mntu/nestjs-ldap';

  @Module({
    imports: [
      ...
      LdapModule.registerAsync({
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => (
          {
            logger: new Logger(AppModule.name),
            cache: new Redis(), /* optional */
            cacheUrl: 'redis://username:password@redis-example.com:6379/0', /* optional */
            cacheTtl: 600, /* optional */
            domains: [
              { 
                name: 'example.com',
                url: 'ldaps://localhost:636',
                bindDN: 'CN=admin,DC=example,DC=local',
                bindCredentials: 'admin',
                searchBase: 'DC=example,DC=local',
                searchFilter: '(&(&(|(&(objectClass=user)(objectCategory=person))(&(objectClass=contact)(objectCategory=person)))))',
                searchScope: 'sub' as Scope,
                groupSearchBase: 'DC=example,DC=local',
                groupSearchFilter: '(&(objectClass=group)(member={{dn}}))',
                groupSearchScope: 'sub' as Scope,
                groupDnProperty: 'dn',
                hideSynchronization: false,
                searchBaseAllUsers: 'DC=example,DC=local',
                searchFilterAllUsers: '(&(&(|(&(objectClass=user)(objectCategory=person))(&(objectClass=contact)(objectCategory=person)))))',
                searchFilterAllGroups: 'objectClass=group',
                searchScopeAllUsers: 'sub' as Scope,
                newObject: 'DC=example,DC=local',
                reconnect: true,
                groupSearchAttributes: ldapADattributes,
                searchAttributes: ldapADattributes,
                searchAttributesAllUsers: ldapADattributes,
                tlsOptions: { rejectUnauthorized: false },
              },
            ]
          }),
      }),
      ...
    ]
  })
  export class AppModule {}
```

## Bonus
- [OpenLDAP docker image](https://hub.docker.com/r/osixia/openldap) 
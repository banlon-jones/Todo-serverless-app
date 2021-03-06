import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
//import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

//const jwksUrl = 'https://test-endpoint.auth0.com/.well-known/jwks.json'
export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken )
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt
  
  // TODO: Implement token verification
  const certificate = `-----BEGIN CERTIFICATE-----
  MIIDCTCCAfGgAwIBAgIJLAmkxs4kIPHJMA0GCSqGSIb3DQEBCwUAMCIxIDAeBgNV
  BAMTF3Rlc3QtZW5kcG9pbnQuYXV0aDAuY29tMB4XDTE5MDQwNzE1MjMzM1oXDTMy
  MTIxNDE1MjMzM1owIjEgMB4GA1UEAxMXdGVzdC1lbmRwb2ludC5hdXRoMC5jb20w
  ggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC6GcM+A7Hp8bvFNwKASxlh
  xcwA0EuFWc8w9Eis7AS392sjd2ZV3TekeMpoNwozfJncES/fLdtPN8uFOOYykKTF
  K1M1LpfqLvRFr8x3jM7UxpAzqXz1NvXp88VGtk2FwJ88Y5103pCayCGHGKlZx3nq
  3u7JvwhoHl5ZpnN0jrsdqSdBjE5pOTbseCkygk8TFUyJ4pWG//8oamHwGSEOk9z6
  n36bzwScB8JQirhPzst40WmXqnF3SnSwFJK3wpckyO0vZbuqNGBSJKQgJYh9NECu
  fi2stC5UF9OIjBC4SGcmDmaQuTCjb4GFfrkSARmbSjSJqYNqrSIemGLeCa5MJNuB
  AgMBAAGjQjBAMA8GA1UdEwEB/wQFMAMBAf8wHQYDVR0OBBYEFIJyYhlzJfj6a4J5
  Mahj6zKGrjMYMA4GA1UdDwEB/wQEAwIChDANBgkqhkiG9w0BAQsFAAOCAQEALrMd
  IlGLtrh71nHa57smyj/NSZGeyRuaoagj3WLCkoAh8OnAgGNSC1OV0tIt8ZMOXy7D
  aAamQQbfHSZ9qX1N2DhaU9+lpgHls6FEO8gEW2b1KKfJ9/YfSfHaRGNvpSqEuxMo
  pYQnaBdWtTly0yP9JBoMl9MRbNyffUdLXWlHtq2YLo8oWsLXI71cZf6ZB+sT79AA
  AiZPr1VtbQZOhrsS6iDxAR6kXwZben1qbTEBgGURU1t3frrNQ0RzxArjWf5qIFk+
  T6JsUVfTqyG1gFfoQ4EAy2NGppNTI8WAefHna5O6+Hz8WHrciCqCYbvBWPvSDGwl
  N1FDtwZVhZFsYQkSgw==
  -----END CERTIFICATE-----`
  
  return verify(token, certificate, { algorithms: [`${jwt.header.alg}`] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

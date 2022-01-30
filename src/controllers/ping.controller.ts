import {inject} from '@loopback/core';
import {
    Request,
    RestBindings,
    get,
    response,
    ResponseObject, post,
} from '@loopback/rest';
import {repository} from "@loopback/repository";
import {CategoryRepository} from "../repositories";

/**
 * OpenAPI response for ping()
 */
const PING_RESPONSE: ResponseObject = {
    description: 'Ping Response',
    content: {
        'application/json': {
            schema: {
                type: 'object',
                title: 'PingResponse',
                properties: {
                    greeting: {type: 'string'},
                    date: {type: 'string'},
                    url: {type: 'string'},
                    headers: {
                        type: 'object',
                        properties: {
                            'Content-Type': {type: 'string'},
                        },
                        additionalProperties: true,
                    },
                },
            },
        },
    },
};

/**
 * A simple controller to bounce back http requests
 */
export class PingController {
    constructor(
        @repository(CategoryRepository) private categoryRepo: CategoryRepository,
        @inject(RestBindings.Http.REQUEST) private req: Request) {
    }

    @get('/category')
    @response(200, PING_RESPONSE)
    category(): object {
        return this.categoryRepo.find()
    }

    @post('/category')
    @response(200, PING_RESPONSE)
    createCategory(): object {
        return this.categoryRepo.create({
            id: '1',
            description: 'teste descriptopn',
            name: 'teste'
        })
    }

    // Map to `GET /ping`
    @get('/ping')
    @response(200, PING_RESPONSE)
    ping(): object {
        // Reply with a greeting, the current time, the url, and request headers
        return {
            greeting: 'Hello from LoopBack',
            date: new Date(),
            url: this.req.url,
            headers: Object.assign({}, this.req.headers),
        };
    }
}

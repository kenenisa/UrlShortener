"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const passport_1 = __importDefault(require("passport"));
const client_1 = require("@prisma/client");
dotenv_1.default.config();
//
const Google_1 = __importDefault(require("./Auth/Google"));
const prisma = new client_1.PrismaClient();
//
function makeId(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = (0, express_1.default)();
        const port = process.env.PORT || 8800;
        console.log(process.env.PORT);
        app.use((0, express_session_1.default)({ secret: process.env.SECRET, resave: false, saveUninitialized: true }));
        app.use(passport_1.default.initialize());
        app.use(passport_1.default.session());
        app.use(express_1.default.json());
        app.use(express_1.default.urlencoded({
            extended: true
        }));
        app.get('/auth/google', passport_1.default.authenticate('google', { scope: ['email', 'profile'] }));
        app.get('/google/callback', passport_1.default.authenticate('google', {
            successRedirect: '/',
            failureRedirect: '/auth/failed'
        }));
        app.get('/auth/failed', (req, res) => {
            res.send('Something went wrong...');
        });
        function slugModify(slug) {
            return process.env.URL + '/' + slug;
        }
        app.post('/submit/url', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const original = req['body'].url;
            const slug = makeId(6);
            const link = yield prisma.link.create({
                data: {
                    slug,
                    original
                }
            });
            link.slug = slugModify(slug);
            res.json(link);
        }));
        app.get('/:slug', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const slug = req.params.slug;
            const link = yield prisma.link.findFirst({ where: {
                    slug
                } });
            res.redirect((link === null || link === void 0 ? void 0 : link.original) || process.env.URL || '');
        }));
        // app.use(logger);
        // set static folder
        app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
        app.listen(port, () => {
            (0, Google_1.default)(prisma);
            console.log(`UrlShortener is running on port ${port}...`);
        });
        // ... you will write your Prisma Client queries here
        // const user = await prisma.user.create({
        //     data: {
        //       name: 'Alice',
        //       email: 'alice@prisma.io',
        //     },
        //   });
        // const users = await prisma.user.findMany();
        // console.log(users)
    });
}
main()
    .then(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}))
    .catch((e) => __awaiter(void 0, void 0, void 0, function* () {
    console.error(e);
    yield prisma.$disconnect();
    process.exit(1);
}));

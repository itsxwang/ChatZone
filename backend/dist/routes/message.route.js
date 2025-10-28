"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.get('/send', (req, res) => {
    res.send('S Message endpoint');
});
router.get('/receive', (req, res) => {
    res.send('R Message endpoint');
});
exports.default = router;

import { Router } from "express";
const router = Router();

router.post("/placeorder", async (req, res)=>{
    res.json({message: "working"});
})

export default router;
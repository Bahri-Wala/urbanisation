const Experience = require("../models/experience_model");
const Partner = require("../models/partner_model");
const Price = require("../models/price_model");


function removeAll(originalSet, toBeRemovedSet) {
    [...toBeRemovedSet].forEach(function(v) {
      originalSet.delete(v); 
    });
}

// async function calcul_price(programme){
//     prices = await Price.find()
//     total = 0
//     programme.forEach(prog => {
//         // a reviser
//         if(prices.experienceId == prog.experienceId && prices.partnerId == prog.partnerId){
//             total += prices.price
//         }
//     })
// }

module.exports = {   
    build_devis: async (req, res, next) => {
        const request = req.body;
        var experience_partner_dispo = new Set()
        if(request.experiences.length == 0){
            res.status(200).send({ "programme": "no program available" , "price": 5000})
        }
        for (exp of request.experiences) {
            var x = await Experience.findById(exp.id)
            var detail = await Experience.findById(exp.id).populate('PartnersId');


            for (partner of detail.PartnersId) {
                var dispos = partner.disponibilites
                for (dispo of dispos) {
                    start = new Date(request.date_start)
                    end = new Date(request.date_end)
                    if ((dispo.state === "yes") && (dispo.date.getDate() <= end.getDate()) && (dispo.date.getDate() >= start.getDate())) {
                        experience_partner_dispo.add({ "experienceId":exp.id,"partnerId": partner.id, "time": dispo.date })
                    }
                }
            }   
        }
        partners_selected = new Set()
        duplicated = new Map()
        experience_partner_dispo.forEach(triplet=>{
            if(duplicated.has(triplet.experienceId)){
                partners_selected.delete(triplet)
            }else{
                partners_selected.add(triplet)
                duplicated.set(triplet.experienceId,triplet)
            }  
        })
        duplicated_set = new Set(duplicated.values())
        removeAll(duplicated_set,partners_selected)
        //////////////////////////////////////////////////////////////////////
        // duplicated_set = new Set([{
        //     experienceId: '63371693e61e1410589439e5',
        //     partnerId: '6393c41c1a4270e14a3c8976',
        //     time: new Date("2022-12-15T00:00:00.000Z")
        // },{
        //     experienceId: '63371693e61e1410589439e5',
        //     partnerId: '6393c41c1a4270e14a3c8970',
        //     time: new Date("2022-12-16T00:00:00.000Z")
        // },{
        //     experienceId: '63371693e61e1410589439e0',
        //     partnerId: '6393c41c1a4270e14a3c8970',
        //     time: new Date("2022-12-16T00:00:00.000Z")
        // },{
        //     experienceId: '63371693e61e1410589439e0',
        //     partnerId: '6393c41c1a4270e14a3c8955',
        //     time: new Date("2022-12-16T00:00:00.000Z")
        // }])
        // partners_selected.delete({
        //     experienceId: '63371693e61e1410589439e5',
        //     partnerId: '6393c41c1a4270e14a3c8976',
        //     time: new Date("2022-12-15T00:00:00.000Z")
        // })
        //////////////////////////////////////////////////////////////////////
        maximum = new Map()
        while(partners_selected.size < request.experiences.length){
            duplicated_set.forEach(triplet => {
                if(maximum.has(triplet.partnerId)){
                    maximum.get(triplet.partnerId).push(triplet)
                }else{
                    maximum.set(triplet.partnerId,[triplet])
                }
                
            })
            maxim = 0
            maxim_tab = []
            Array.from(maximum.values()).forEach(tab => {
                if(tab.length > maxim){
                    maxim = tab.length
                    maxim_tab = tab
                }
            })
            maxim_tab.forEach(triplet => {
                partners_selected.add(triplet)
                duplicated_set.delete(triplet)
                duplicated_set.forEach(existant => {
                    if(triplet.experienceId == existant.experienceId){
                        duplicated_set.delete(existant)
                    }
                })
            })
        }
        // price = calcul_price(partners_selected)
        res.status(200).send({ "programme": Array.from(partners_selected) , "price": 5000})
    }
}



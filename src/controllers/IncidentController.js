const connection = require('../database/connection');

module.exports = {

    async index (req, res) {
        const { page = 1 } = req.query;
        const incidents = await connection('incidents')
        .join('ongs', 'ongs.id','=','incidents.ong_id')
        .limit(5)
        .offset(5 * (page-1))
        .select(['incidents.*',
            'ongs.name',
            'ongs.email',
            'ongs.whatsapp',
            'ongs.city',
            'ongs.uf'
        ]);

        const [count] = await connection('incidents').count('id');

        res.header('X-Total-Count', count['count(`id`)']);
        return res.json(incidents);
    },

    async create(req, res) {
        const { title, description, value } = req.body;
        const ong_id = req.headers.authorization;
        const [id] = await connection('incidents').insert({
           title, 
           description,
           value,
           ong_id 
        });
        return res.json({ id });
    },

    async delete (req, res) {
        const response = req.params;
        const id = response[1];
        const ong_id = req.headers.authorization;
        console.log(ong_id);
        console.log(response[1]);
        console.log(req.params);
        const incident = await connection('incidents').where('id',id).select('ong_id').first();

        if(incident.ong_id != ong_id) {
            return res.status(401).json({ error: "operation not permited"});
        }

        await connection('incidents').where('id',id).delete();
        return res.status(204).send();
    }
}
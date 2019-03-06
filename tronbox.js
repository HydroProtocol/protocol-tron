module.exports = {
    networks: {
        development: {
            // For trontools/quickstart docker image
            privateKey: 'da146374a75310b9666e834ee4ad0866d6f4035967bfc76217c5a495fff9f0d0',
            userFeePercentage: 100, // or consume_user_resource_percent
            feeLimit: 100000000, // or fee_limit
            originEnergyLimit: 1e7, // or origin_energy_limit
            callValue: 0, // or call_value
            fullNode: 'http://127.0.0.1:8090',
            solidityNode: 'http://127.0.0.1:8091',
            eventServer: 'http://127.0.0.1:8092',
            network_id: '*'
        },
        shasta: {
            privateKey: '4876203b1ed8fb5227d58ea6537534f1c5c7a0c41ac310c3b46af5286ed00dbc',
            userFeePercentage: 100,
            feeLimit: 1000000000,
            originEnergyLimit: 10000000,
            callValue: 0,
            fullNode: 'https://api.shasta.trongrid.io',
            solidityNode: 'https://api.shasta.trongrid.io',
            eventServer: 'https://api.shasta.trongrid.io',
            network_id: '*'
        }
    }
};

# Off-chain Storage Verification

An experimental implementation of [Audita: A Blockchain-based Auditing Framework for Off-chain Storage](https://arxiv.org/pdf/1911.08515.pdf)

## Building the libpdp library :

Follow instructions in the [libpdp](link) project.


## Running the storage on different machines for each network participant

### Get the blockchain running :

Get the nodes of the internal blockchain running using [Quorum Maker](https://github.com/synechron-finlabs/quorum-maker)

### Get the installations done :
Get Node.js version 10.13.0 installed then you can run the following commands once you're in the repository off-chain-storage-api :

    npm i    
    npm run compile
    
In the file ```node_modules/web3-core-helpers/src/formatters.js```, line 239, replace ```block.timestamp = utils.hexToNumber(block.timestamp)``` by ``` block.timestamp = Number.parseInt(parseInt(block.timestamp).toString().substring(0,10))```
    
    npm start




### Deploy contracts

Open a Postman page and on the address you're running the script you can send:

A POST request to

    /API/Init/Deploy

with the following JSON for example where :
- k the number of chunks that will be send to the storage node,
- n the total number of chunks,
- l the number of storage nodes that will be challenged at each round
- m the number of storage nodes that will store the chunks.

    {
    "k": 5,
    "n": 10,
    "l": 2,
    "m": 2
    }   


Expected response : a Json with the addresses of the contracts deployed :

    {
    "root": "0x76C114B173C114A26F26129930Cd7703d86199b0",
    "constants": "0x191b10cEBaF40a5499C6FCbAb9a11f2046C5d3f3",
    "identity": "0x6B66d3740cB1AA67afd8262fFBff44b067C662D1",
    "storageFactory": "0xa1cf827Ee7D84a3009DeC4aC77bd58400c8Ec0cD",
    "validationFactory": "0x55c0BeAAA657Aafa6d9C8075a7a36bEC84335349"
    }
### Get the constants from the nework

A GET request to

    /API/Constants/GetAll

You should get a respons like :

    {
    "0": "5",
    "1": "10",
    "2": "2",
    "3": "2",
    "k": "5",
    "n": "10",
    "l": "2",
    "m": "2"
    }

### Register to the network

A POST request to

    /API/Init/SetId

with the following JSON for example :

    {
    "endpoint": "10.112.50.214",
    "address": "0xFB7240bf328B98d34AB6b92F473465cd1Ef17d56",
    "role": "StorageNode"
    }

If the registration is well processed you should get a response in this form :

    {
    '0': '10.112.50.214',
    '1': '0xFB7240bf328B98d34AB6b92F473465cd1Ef17d56',
    msgEndPoint: '10.112.50.214',
     ethAddress: '0xFB7240bf328B98d34AB6b92F473465cd1Ef17d56'

    }

If the person is already in the system you get :

    { error: 'Identity already registrated' }

If the role is not well specified you get :

    { error: 'This role does not exist in the network. Available roles: TrustedDealer, Validator, StorageNode' }

### Store a file

A POST request to

    /API/StorageFactory/StoreFile

with the following JSON for example :

    {
    "path": "app/modules/libpdp/data/testfile"
    }

You get the following result if the storage is correctly done :

    {
    "result": [
        {
            "SNSelected ": "0xFB7240bf328B98d34AB6b92F473465cd1Ef17d56",
            "Indexs ": "1"
        },
        {
            "SNSelected ": "0xFB7240bf328B98d34AB6b92F473465cd1Ef17d56",
            "Indexs ": "3"
        },
        {
            "SNSelected ": "0xFB7240bf328B98d34AB6b92F473465cd1Ef17d56",
            "Indexs ": "5"
        },
        {
            "SNSelected ": "0xFB7240bf328B98d34AB6b92F473465cd1Ef17d56",
            "Indexs ": "6"
        },
        {
            "SNSelected ": "0xFB7240bf328B98d34AB6b92F473465cd1Ef17d56",
            "Indexs ": "9"
        },
        {
            "SNSelected ": "0x519cAd907605346E3FD11228085fb34BB9b4D910",
            "Indexs ": "0"
        },
        {
            "SNSelected ": "0x519cAd907605346E3FD11228085fb34BB9b4D910",
            "Indexs ": "3"
        },
        {
            "SNSelected ": "0x519cAd907605346E3FD11228085fb34BB9b4D910",
            "Indexs ": "4"
        },
        {
            "SNSelected ": "0x519cAd907605346E3FD11228085fb34BB9b4D910",
            "Indexs ": "7"
        },
        {
            "SNSelected ": "0x519cAd907605346E3FD11228085fb34BB9b4D910",
            "Indexs ": "8"
        }
    ]
    }

If the path is not right you get :

    {error: "No file in such directory"}


### Run validation process

The validation process can be run by sending a POST request without args to :  

    /API/ValidationFactory/Init



## Running with docker

Please make sure you've got docker installed and clone the docker branch from this repository

### Running command :
On the right folder you can get up the nodes (2 validators, 3 storage nodes and 1 trusted file dealer) with the following command:

    docker-compose up

### Testing scenario :

1. Get the Blockchain running
2. Deploy the contracts

Deployment : POST request to

    /API/Init/Deploy  

With the following JSON :

    {
    "k": 5,
    "n": 10,
    "l": 2,
    "m": 3
    }

3. Set Ids

Set IDs : POST request to :

    /API/Init/SetId

With the following JSON :

A. For the trusted dealer :

    {
    "endpoint": "10.112.50.215:3001",
    "address": "0x5b3d95b176019eb94f6f226be4b5aa2669523d7e",
    "role": "TrustedDealer"
    }

B. For the Storage nodes :

    {
    "endpoint": "10.112.50.215:3002",
    "address": "0x92e6b532deda7062ea811ef6f6056d669a43bbb4",
    "role": "StorageNode"
    }

    {
    "endpoint": "10.112.50.215:3003",
    "address": "0xd473527fa8f071e9bc7bba0598f720faf2fe24d3",
    "role": "StorageNode"
    }

    {
    "endpoint": "10.112.50.215:3006",
    "address": "0xe9091599589cb20e7c370ad45264eba11bd7e22e",
    "role": "StorageNode"
    }

C. For the validators :

    {
    "endpoint": "10.112.50.215:3004",
    "address": "0xe286a951832a997081d4527f5cf8054be6724a60",
    "role": "Validator"
    }

    {
    "endpoint": "10.112.50.215:3005",
    "address": "0xa77e72324ea0bbd7305dd42e8e0ecf7d1808ff74",
    "role": "Validator"
    }

4. Run the docker-compose

    docker-compose up

5. Send a file

Sending a file : a POST request to :

    /API/StorageFactory/StoreFile

With the following JSON :

    {
    "path": "app/modules/libpdp/data/testfile"
    }

6. Initiate the validation process

With a POST request to :

    /API/ValidationFactory/Init

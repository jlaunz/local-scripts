/*
    load csv
    parse csv
    request fsc
    more
*/
import { processCsv, processLocalCsv } from "../utils/csv"

async function main(){
    const csv = await processLocalCsv("res/ffsup.csv")
    console.log(csv)
}

main()
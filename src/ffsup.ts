/*
    load csv
    parse csv
    request fsc
    more
*/
import { processCsv, processLocalCsv } from "../utils/csv"

async function main(){
    // TODO: this path is relative to the terminal pwd (i.e project root directory)
    const csv = await processLocalCsv("./res/ffsup/DailyExtract_FFSUP_Investment_2025-05-07.csv")
    console.log(csv)
}

main()
```sql
with
    addr_list as (
        SELECT
            from_address,
            count(1) as num
        FROM
            bsc.transactions
        WHERE
            to_address = '0xb68443ee3e828bad1526b3e0bdf2dfc6b1975ec4'
            AND block_number >= 23546603
            AND block_number <= 23546603 + 20 * 60 * 5
            AND LEFT(input, 10) = '0x4b8a3529'
            AND status = 1
        group by
            from_address
        order by
            num DESC
    ),
    hey_transfers as (
        SELECT
            to_address,
            sum(value) / POW(10, 18) as profit
        FROM
            bsc.token_transfers
        WHERE
            contract_address = '0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5'
            AND block_number >= 23546603
            AND block_number <= 23546603 + 20 * 60 * 5
        group by
            to_address
    )
SELECT
    t1.from_address as address,
    t2.profit as profit
FROM
    addr_list as t1
    join hey_transfers as t2 on t1.from_address = t2.to_address
order by
    profit DESC
```


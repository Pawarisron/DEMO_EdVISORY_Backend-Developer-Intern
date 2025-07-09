import { Transaction } from './../entities/Transaction';
import { FastifyReply } from "fastify";
import { UserPrincipleRequest } from "../types/UserPrincipleRequest";
import { getSummaryByUserIdSchema } from "../schemas/summary/getSummaryByUserIdSchema";
import { AppDataSource } from "../database/dataSource";
import { config } from "../../config";
import { getSummaryAllowanceByUserIdSchema } from "../schemas/summary/getSummaryAllowanceByUserIdSchema";
import { differenceInCalendarDays } from 'date-fns';
import ExcelJS from 'exceljs';

//get summary 
export const getSummaryByUserId = async (req:UserPrincipleRequest, reply:FastifyReply) =>{
    try{
        //validation
        const {error, value} = getSummaryByUserIdSchema.validate(req.query || null)
        if(error){
            return reply.code(400).send({ message: 'Invalid query parameters', details: error.details });
        }
        const userId = req.user?.id;
        if(!userId){
            return reply.code(401).send({ message: 'Unauthorized'});
        }

        const format = value.format;
        const mode = value.mode;
        const date = new Date(value.date);
        const month = value.month;
        const year = value.year;
        const from = value.from;
        const to = value.to;
        const accountId = value.accountId;

        //repo joined table
        const query = AppDataSource.getRepository(Transaction)
        .createQueryBuilder('t')
        .leftJoin('t.category', 'category')
        .leftJoin('t.account', 'account')
        .leftJoin('t.user','user')
        .where('t.user_id = :userId', { userId });
        
        //Filter
        if (mode === 'day') {
            query.andWhere('t.transaction_date = :date', { date });
        
        } else if (mode === 'month') {
            query.andWhere('EXTRACT( MONTH FROM t.transaction_date ) = :month', { month });
            query.andWhere('EXTRACT( YEAR FROM t.transaction_date ) = :year', { year });

        } else if (mode === 'year') {
            query.andWhere('EXTRACT( YEAR FROM t.transaction_date ) = :year', { year });

        } else if (mode === 'range') {
            query.andWhere('t.transaction_date BETWEEN :from AND :to', { from, to });
        }

        if (accountId) query.andWhere('t.account_id = :accountId', { accountId });

        // sum income
        const incomeResult = await query.clone()
        .andWhere('category.type = :type', { type: 'INCOME' })
        .select('SUM(t.amount)', 'total')
        .getRawOne();

        // sum outcome
        const expenseResult = await query.clone()
        .andWhere('category.type = :type', { type: 'EXPENSE' })
        .select('SUM(t.amount)', 'total')
        .getRawOne();

        const income = parseFloat(incomeResult?.total || '0');
        const expense = parseFloat(expenseResult?.total || '0');

        //export
        if(format && format == "excel"){
            const transactions = await query.select([
                't.id',
                't.amount',
                't.transaction_date',
                'category.type',
                'category.name',
                'account.name',
                'user.username',
                't.note_cleaned'
            ])
            .getMany();
            const buffer = await exportExcel(transactions, {
                income: income,
                expense: expense,
                balance: income - expense,
            })
            return reply
                .header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
                .header('Content-Disposition', 'attachment; filename=data.xlsx')
                .send(buffer);
        }

        // Pagination
        const page = value.page || 1;
        const size = config.allowedPageSize.includes(value.size) ? value.size : config.allowedPageSize[0];
        const skip = (page  - 1) * size;
        const [transactions, total] = await query
        .orderBy('t.transaction_date', 'DESC')
        .skip(skip)
        .take(size)
        .select([
            't.id',
            't.amount',
            't.transaction_date',
            'category.type',
            'category.name',
            'account.name',
            'user.username',
            't.note_cleaned'
        ])
        .getManyAndCount();
        return {
            transaction: transactions,
            summary: {
                income: income,
                expense: expense,
                balance: income - expense,
            },
            mode,
            range: {
                from,
                to,
            },
            pagination: {
                total,
                page,
                size: size,
                totalPages: Math.ceil(total / size),
            }
        };

    }catch(error){
        req.log.error(error);
        reply.code(500).send({ message: 'Internal Server Error', details: error });
    }
    
}

//get summary allowance
export const getSummaryAllowanceByUserId = async (req:UserPrincipleRequest, reply:FastifyReply) =>{
    try{
        //validation
        const {error, value} = getSummaryAllowanceByUserIdSchema.validate(req.query || null)
        if(error){
            return reply.code(400).send({ message: 'Invalid query parameters', details: error.details });
        }
        const userId = req.user?.id;
        if(!userId){
            return reply.code(401).send({ message: 'Unauthorized'});
        }

        const mode = value.mode; 
        const today = new Date(value.today);
        const payday = value.payday;
        const monthlyExpense = value.monthlyExpense;
        const accountId = value.accountId;
        const daysRemaining = differenceInCalendarDays(payday, today) + 1;
        const format = value.format
        
        const query = AppDataSource.getRepository(Transaction)
        .createQueryBuilder('t')
        .leftJoin("t.category","category")
        .leftJoin("t.account","account")
        .leftJoin('t.user','user')
        .where("t.user_id = :userId", { userId })
        
        if(accountId){
            query.andWhere("t.account_id = :accountId",{accountId});
        }
        if(mode === "expect"){
            query.andWhere("category.type = :type",{type: "INCOME"})
        }

        let availablePerDay = 0;
        let sum = 0
        let expense = 0

        // sum income
        const incomeResult = await query.clone()
        .andWhere('category.type = :type', { type: 'INCOME' })
        .select('SUM(t.amount)', 'total')
        .getRawOne();
        const income = parseFloat(incomeResult?.total || '0');
        
        //Actual income and expense
        if(mode === "actual"){
            // sum expense
            const expenseResult = await query.clone()
            .andWhere('category.type = :type', { type: 'EXPENSE' })
            .select('SUM(t.amount)', 'total')
            .getRawOne();
            expense = parseFloat(expenseResult?.total || '0');

            sum = income - expense;
            availablePerDay = sum / daysRemaining;

        }
        //Expect monthly expense
        if(mode === "expect"){
            sum = income - monthlyExpense;
            availablePerDay = sum / daysRemaining
        }

        //export
        if(format && format == "excel"){
            const transactions = await query.select([
                't.id',
                't.amount',
                't.transaction_date',
                'category.type',
                'category.name',
                'account.name',
                'user.username',
                't.note_cleaned'
            ])
            .getMany();
            const buffer = await exportExcel(transactions, {
                income: income,
                ...(mode === "expect" ? {monthlyExpenses:monthlyExpense}: {expense:expense}),
                balance: sum,
                daysRemaining: daysRemaining,
                availablePerDay: availablePerDay,
            })
            return reply
                .header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
                .header('Content-Disposition', 'attachment; filename=data.xlsx')
                .send(buffer);
        }

        // Pagination
        const page = value.page || 1;
        const size = config.allowedPageSize.includes(value.size) ? value.size : config.allowedPageSize[0];
        const skip = (page  - 1) * size;
        const [transactions, total] = await query
        .orderBy('t.transaction_date', 'DESC')
        .skip(skip)
        .take(size)
        .select([
            't.id',
            't.user_id',
            't.amount',
            't.transaction_date',
            'category.type',
            'category.name',
            'account.name',
            't.note_cleaned'
        ])
        .getManyAndCount();

        return reply.code(200).send({
            transaction: transactions,
            summary: {
                income:income,
                ...(mode === "expect" ? {monthlyExpenses:monthlyExpense}: {expense:expense}),
                balance:sum,
                // sumExpense:expense,
                daysRemaining: daysRemaining,
                availablePerDay: availablePerDay,
            },
            mode,
            today,
            payday,
            pagination: {
                total,
                page,
                size: size,
                totalPages: Math.ceil(total / size),
            }
        });
    }catch(error){
        req.log.error(error);
        reply.code(500).send({ message: 'Internal Server Error', details: error });
    }
}

type Summary = {
    income?:number;
    expense?:number;
    monthlyExpenses?:number;
    balance?:number;
    daysRemaining?:number;
    availablePerDay?:number;
}

//Export excel
async function exportExcel(rawData:Transaction[], summary:Summary){

    //Map data
    const data = rawData.map(row => ({
        id: row.id,
        username: row.user?.username,
        accountName: row.account?.name,
        categoryName: row.category?.name,
        type: row.category?.type,
        amount: row.amount,
        date: row.transaction_date,
        note: row.note_cleaned
    }));

    //create excel
    const workbook = new ExcelJS.Workbook();
    const summarySheet = workbook.addWorksheet('Summary')
    const dataSheet = workbook.addWorksheet('Data');

    //add summary data
    summarySheet.addRow(['Summary']);
    if (summary.income !== undefined) summarySheet.addRow(['Income', summary.income]);
    if (summary.expense !== undefined) summarySheet.addRow(['Expense', summary.expense]);
    if (summary.monthlyExpenses !== undefined) summarySheet.addRow(['Monthly Expense', summary.monthlyExpenses]);
    if (summary.balance !== undefined) summarySheet.addRow(['Balance', summary.balance]);
    if (summary.daysRemaining !== undefined) summarySheet.addRow(['Days Remaining', summary.daysRemaining]);
    if (summary.availablePerDay !== undefined) summarySheet.addRow(['Available per Day', summary.availablePerDay]);

    //create col
    dataSheet.columns = [
        { header: 'ID', key: 'id' },
        { header: 'Username', key: 'username' },
        { header: 'Account', key: 'accountName' },
        { header: 'Category', key: 'categoryName' },
        { header: 'Type', key:'type'},
        { header: 'Amount', key: 'amount'},
        { header: 'Date', key: 'date'},
        { header: 'Note', key: 'note'},
    ];
    //add add data
    dataSheet.addRows(data);
    //return buffer
    return await workbook.xlsx.writeBuffer();
}
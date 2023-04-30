# ./examples/software/dbs.asmX
@import stream;

#----------------------------------------------------------------
# This getCell label structure for get cell
#----------------------------------------------------------------
@label getCell:
    @call print("name cell: ")
    @call read()
    @get set::$urt
    @call print("value cell: ")
    @call print($get);
#----------------------------------------------------------------


#----------------------------------------------------------------
@call print("Office DB is running in the following");
@call print("Count create cell to db?: ");
@call read();
@set count_cell_to_db Int $urt;
#----------------------------------------------------------------


#----------------------------------------------------------------
@call print("name cell: ");
@call read();
@call print("value cell: ");
@call read();
@set $urt[1] Auto $urt[2];
@Execute jmp 0x05 set::count_cell_to_db;
#----------------------------------------------------------------


#----------------------------------------------------------------
@call print("Need get cell? [1 (yes) / 0 (no)]: ");
@call read();
@Execute cmp $urt 0x00;
@execute jmp_great getCell;
#----------------------------------------------------------------
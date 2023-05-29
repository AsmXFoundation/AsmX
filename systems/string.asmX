@Unit get_char(string: String, index: Int):
    @get [string][[index]]
    @Ret $get


@Unit is_Empty(symbol):
    @Execute eq [symbol] Empty
    @Ret $eq
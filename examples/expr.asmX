@call print(expr'');                                                    # 0
@call print(expr'*');                                                   # 0
@call print(expr'2');                                                   # 2
@call print(expr'1/2');                                                 # 0.5
@call print(expr'2 * 2 + 5 * 10^2');                                    # 504
@call print(expr'2 * 2 + 5 * (4 + (10^2 * (2 + 2)) + 2) + (4 + 1)');    # 2039
@call print(expr'2 * 2 + 5 * (4 + (10^2 * (2 + 2)) + 2) + 1');          # 2035
@call print(expr'(2 * pi) + 0.72');                                     # 7
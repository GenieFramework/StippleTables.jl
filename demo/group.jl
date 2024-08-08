using GenieFramework
@genietools
using StippleTables, DataFrames

df = DataFrame(
    ID = 1:20,
    Department = repeat(["Sales", "Marketing", "IT", "HR"], 5),
    Employee = ["Emp" * string(i) for i in 1:20],
    Salary = rand(50000:5000:100000, 20),
    Sales = rand(50000:5000:100000, 20),
    HireDate = Date(2020,1,1) .+ Day.(rand(1:1000, 20)),
    Performance = rand(["Excellent", "Good", "Average", "Poor"], 20)
)
@app begin
    @out title= "Employee data"
    @out table = DataTable(df)
    # data grouping
    @in group_by::Any = "Department"
    @out group_by_options = ["Department", "HireDate", "Performance"]
    @in groupkeys::Vector{Any} = unique(df[!, :Department])
    @in selectedkey::Any = "Sales"

    @onchange group_by begin
        if group_by == ""
            groupkeys = []
            table = DataTable(df)
        else
            groupkeys = unique(df[:,group_by])
            selectedkey = first(groupkeys)
        end
   end

    @onchange selectedkey begin
       # the grouping is performed when a new key is selected to avoid having to store
       # the grouped dataframe. For small dataframes, you can store the gdf in a @private variable
       # and use this handler to pick a group from it
       table = groupby(df, group_by)[(selectedkey,)] |> DataFrame |> DataTable
    end

end

ui() ="""
<st-table 
    :data='table.data' 
    :columns='table.columns' 
    :title="title" 
    :search="true" 
    :searchcolumns="true" 
    :showcontrols="true" 
    :rows-per-page-options="[10, 20, 50]" 
    :groupby.sync="group_by"
    :groupbyoptions="group_by_options" 
    :groupkeys="groupkeys"
    :selectedkey.sync="selectedkey"
/>
""" 

@page("/", ui)

module StippleTables

using Stipple, StippleUI.API

export sttable 

const assets_config = Genie.Assets.AssetsConfig(package="StippleTables.jl")

import Stipple.Genie.Renderer.Html: register_normal_element, normal_element

register_normal_element("st__table", context=@__MODULE__)


function sttable(;kwargs...)
    st__table(;kw([kwargs...])...)
end

function deps_routes()
    Genie.Assets.external_assets(Stipple.assets_config) && return nothing

    Genie.Router.route(Genie.Assets.asset_route(assets_config, :js, file="StTable"), named=:get_sttable) do
        Genie.Renderer.WebRenderable(
            Genie.Assets.embedded(Genie.Assets.asset_file(cwd=normpath(joinpath(@__DIR__, "..")), file="StTable.js")),
            :javascript) |> Genie.Renderer.respond
    end


    nothing
end

function deps()
    [
        Genie.Renderer.Html.script(src=Genie.Assets.asset_path(assets_config, :js, file="sttable")),
    ]
end

function __init__()
    deps_routes()
    Stipple.deps!(@__MODULE__, deps)
end

end



define(function(require)
{  
  if(!Ractive.components.TabsComponent)
  {
    var numTabsComponents = 0
    
    var component = Ractive.extend({
      template:'{{>content}}',
      components:
      {
        TabsLink: Ractive.extend(
          {
            template: '<a tabsId={{tabsId}} on-tap="Select">{{>content}}</a>',
            data: 
            { 
              Selected : false, 
              tabsId : -1
            },
            init: function()
            {
              this.on("Select", function()
              {
                var tabsComponent = this.get("parentComponent")
                var currentLink = this
                //create helper functions
                function _sameComponent(comp)
                {
                  return comp.data.tabsId == currentLink.get("tabsId")
                }
                function _setSelected(comp)
                {
                  comp.set("Selected", comp.data.PaneId === currentLink.get("PaneId"))
                }
                
                tabsComponent.findAllComponents("TabsPane")
                  .filter(_sameComponent)
                  .map(_setSelected)
                  
                tabsComponent.findAllComponents("TabsLink")
                  .filter(_sameComponent)
                  .map(_setSelected)
              })
            }
          }),
        TabsPane: Ractive.extend(
          {
            template: '<div tabsId={{tabsId}} style={{>PaneStyle}}>{{>content}}</div>',
            data: 
            { 
              Selected : false,
              tabsId : -1
            },
            partials:
            {
              PaneStyle : '{{#if this.Selected}}display: inline-block{{else}}display: none{{/if}}'
            }
          })
      },
      init: function()
      {
        var thisComponent = this
        //calculate id for new tabs component
        var newId = numTabsComponents++
        
        //create helper methods used by init
        function _newComponent(comp)
        {
          return comp.data.tabsId == -1
        }
        function _initComponent(comp)
        {
          //change ID from -1 to the new id
          comp.set("tabsId", newId)
          //tell the component who its parent is
          comp.set("parentComponent", thisComponent)
        }
        
        
        //set id on new tabs components
        this.findAllComponents("TabsPane")
          .filter(_newComponent)
          .map(_initComponent)
        this.findAllComponents("TabsLink")
          .filter(_newComponent)
          .map(_initComponent)
      }
    })
    
    Ractive.components.TabsComponent = component
  }
  return true
})
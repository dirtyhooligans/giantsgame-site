// allows you to select for elements, excluding any children that may also
// match that selection. ie "div:topmost" would only select outer div elements
// and would exclude any div elements within a div
jQuery.extend(jQuery.expr[':'],
{
    topmost: function (e, index, match, array)
    {
        for (var i = 0; i < array.length; i++)
        {
            if (array[i] !== false && $(e).parents().index(array[i]) >= 0)
            {
                return false;
            }
        }
        return true;
    }
});
